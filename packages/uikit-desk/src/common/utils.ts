export function generateRandomPassword( length: number = 6): string {
    let chars = 'abcdefghijklmnpqrstuvwxyz123456789';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

export function formatNumber(num: number): string {
    return num.toLocaleString('en', { useGrouping: true }).replace(/,/g, ' ');
}

export function generateDeviceId(): string {
    let groups = [1, 3, 3, 3];
 
    let deviceId = '';

    groups.forEach((groupLength, index) => {
        for (let i = 0; i < groupLength; i++) {
            let randomDigit = Math.floor(Math.random() * 10); // Generate a random digit (0-9)
            if (groupLength === 1 && randomDigit === 0) {
                randomDigit = 1;
            }
            deviceId += randomDigit;
        }
    });

    return deviceId;
}
export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const elapsed = now - timestamp;
    const ms = (elapsed / 1000).toFixed(2);
    return `${ms} s`;
}

export function deepDiff(obj1: any, obj2: any): boolean {
    let hasDifference = false;

    function findChanges(o1: any, o2: any): void {
        Object.keys(o1).forEach(key => {
            if (
                typeof o1[key] === 'object' &&
                typeof o2[key] === 'object' &&
                o1[key] !== null &&
                o2[key] !== null
            ) {
                findChanges(o1[key], o2[key]);
            } else if (o1[key] !== o2[key]) {
                hasDifference = true;
            }
        });

        Object.keys(o2).forEach(key => {
            if (!(key in o1)) {
                hasDifference = true;
            }
        });
    }

    findChanges(obj1, obj2);
    return hasDifference;
}

export function isDesktop(){
    //@ts-ignore
    return !!window.backgroundApi
}


export function isMac() {
    if(!isDesktop()){
        return false;
    }
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("mac");
}

export function waitForResult(
    cb: () => any | Promise<any>,
    timeout: number = -1,
    interval: number = 1000
): Promise<any | null> {
    const startTime = Date.now();

    return new Promise(resolve => {
        const checkReply = async () => {
            try {
                const res = await Promise.resolve(cb()); // Ensure cb result is a Promise
                if (res) {
                    resolve(res);
                    return;
                }

                // Check for timeout
                if (timeout > -1 && Date.now() - startTime > timeout) {
                    resolve(false);
                    return;
                }

                // Retry after interval
                setTimeout(checkReply, interval);
            } catch (error) {
                console.error('Error in waitForResult callback:', error);
                resolve(false); // Resolve with null on error
            }
        };

        checkReply();
    });
}



export function getVedeoSize(
    viewSize: { width: number; height: number },
    realSize: { width: number; height: number },
    gap: number
) {
    let width = realSize.width;
    let height = realSize.height;

    // Calculate the maximum available space
    let viewWidth = viewSize.width - gap;
    let viewHeight = viewSize.height - gap;

    // If the real size fits within the view size, return real size
    if (width <= viewWidth && height <= viewHeight) {
        return { width, height };
    }

    // Maintain aspect ratio while scaling down
    const widthRatio = viewWidth / width;
    const heightRatio = viewHeight / height;
    const scaleRatio = Math.min(widthRatio, heightRatio); // Scale to fit

    return {
        width: Math.round(width * scaleRatio),
        height: Math.round(height * scaleRatio)
    };
}


export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const captureFrame = (videoElement: HTMLVideoElement) => {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw the current video frame onto the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL (base64 image)
    const imageData = canvas.toDataURL('image/png');

    // console.log('Captured Image:', imageData);
    return imageData;
};

export const destroyStream = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
};

export function getVideoId(source: any) {
    return 'win_' + source.id.replace(/:/g, '_');
}

export function updateApp() {
    window.dispatchEvent(new CustomEvent("updateApp",{detail:{}}))
}



