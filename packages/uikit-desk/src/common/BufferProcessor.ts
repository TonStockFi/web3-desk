export default class BufferProcessor {
    private static FLAG_SIZE = 16; // 预留 16 字节 FLAG
    private static TIMESTAMP_SIZE = 8; // 时间戳 8 字节
    private static encoder = new TextEncoder();
    private static decoder = new TextDecoder();
    private static lastTimestamp = 0; // 乱序检测

    /**
     * 编码 Buffer
     * @param flag - "screen_plain" | "screen_aes"
     * @param videoBuffer - 原始视频数据
     * @returns 编码后的 buffer
     */
    static encodeBuffer(flag: "screen_plain" | "screen_aes", videoBuffer: ArrayBuffer): ArrayBuffer {
        const flagBuffer = new Uint8Array(BufferProcessor.FLAG_SIZE);
        flagBuffer.set(BufferProcessor.encoder.encode(flag));

        const timestamp = performance.now();
        const tsBuffer = new ArrayBuffer(BufferProcessor.FLAG_SIZE + BufferProcessor.TIMESTAMP_SIZE + videoBuffer.byteLength);
        const tsView = new DataView(tsBuffer);

        tsView.setFloat64(BufferProcessor.FLAG_SIZE, timestamp, true); // 写入时间戳
        new Uint8Array(tsBuffer, 0, BufferProcessor.FLAG_SIZE).set(flagBuffer);
        new Uint8Array(tsBuffer, BufferProcessor.FLAG_SIZE + BufferProcessor.TIMESTAMP_SIZE).set(new Uint8Array(videoBuffer));

        return tsBuffer;
    }

    /**
     * 解码 Buffer
     * @param buffer - 接收到的 buffer
     * @returns { flag, timestamp, videoBuffer } 或 null（乱序丢弃）
     */
    static decodeBuffer(buffer: ArrayBuffer): { flag: string; timestamp: number; videoBuffer: ArrayBuffer } | null {
        if (buffer.byteLength < BufferProcessor.FLAG_SIZE + BufferProcessor.TIMESTAMP_SIZE) {
            console.warn("Invalid buffer size");
            return null;
        }

        const tsView = new DataView(buffer);
        const flagArray = new Uint8Array(buffer, 0, BufferProcessor.FLAG_SIZE);
        const flag = BufferProcessor.decoder.decode(flagArray).replace(/\0/g, ""); // 解析 FLAG
        const timestamp = tsView.getFloat64(BufferProcessor.FLAG_SIZE, true); // 解析时间戳
        const videoBuffer = buffer.slice(BufferProcessor.FLAG_SIZE + BufferProcessor.TIMESTAMP_SIZE);

        // **丢弃乱序数据**
        if (!BufferProcessor.validateTimestamp(timestamp)) {
            return null;
        }

        return { flag, timestamp, videoBuffer };
    }

    /**
     * 乱序检测
     * @param timestamp - 当前时间戳
     * @returns 是否有效
     */
    private static validateTimestamp(timestamp: number): boolean {
        if (timestamp < BufferProcessor.lastTimestamp) {
            console.warn(`Dropped out-of-order packet: ts=${timestamp}, last=${BufferProcessor.lastTimestamp}`);
            return false;
        }
        BufferProcessor.lastTimestamp = timestamp;
        return true;
    }
}
