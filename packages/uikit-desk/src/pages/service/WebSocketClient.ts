import AppAPI from '../../common/AppApi';
import { getVideoId, isMac, updateApp } from '../../common/utils';
import { WsCloseCode } from '../../types';
import DesktopDevices, { DeviceConnect } from './DesktopDevices';

import WebSocketCtlClient from './WebSocketCtlClient';

export default class WebSocketClient {
    sources: { name: string; id: string; display_id: string }[];
    device: DesktopDevices;
    setSources(sources: { name: string; id: string; display_id: string }[]) {
        this.sources = sources;
    }
    private socket?: WebSocket;
    deviceId: String;
    password: string;

    winId: string;
    passwordHash: string;
    url: string;
    retry_count: number = 0;

    peerConnection: RTCPeerConnection;
    dataChannel_control?: RTCDataChannel;
    dataChannel_chat?: RTCDataChannel;
    dataChannel_screen?: RTCDataChannel;

    constructor(
        url: string,
        winId: string,
        deviceId: String,
        password: string,
        passwordHash: string
    ) {
        this.sources = [];
        this.url = url;
        this.deviceId = deviceId;
        this.winId = winId;
        this.password = password;
        this.passwordHash = passwordHash;
        this.device = new DesktopDevices(this.winId);

        this.peerConnection = new RTCPeerConnection({
            // iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        this.init();
    }
    getPasswordHash() {
        return this.passwordHash;
    }

    getPassword() {
        return this.password;
    }
    sendChannalControlMessage(message: string) {
        const { dataChannel_control } = this;
        if (dataChannel_control && dataChannel_control.readyState === 'open') {
            dataChannel_control.send(message);
        }
    }
    stopVideo() {
        const videoElement = document.getElementById(
            getVideoId({ id: this.winId })
        ) as HTMLVideoElement;

        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            // Stop all tracks (both video and audio)
            stream.getTracks().forEach(track => track.stop());
            // Clear the video source
            videoElement.srcObject = null;
        }

        // Remove all senders from the peer connection
        this.peerConnection.getSenders().forEach(sender => {
            this.peerConnection.removeTrack(sender);
        });

        // Close the peer connection if you want to completely stop WebRTC
        this.peerConnection.close();
    }
    getWindowSize(screenSource: { id: string; display_id: string; name: string }) {
        let { width, height } = window.screen;
        if (!screenSource.display_id) {
            const windows = WebSocketCtlClient.getWindows();
            const win = windows.find(row => row.title === screenSource.name);
            if (win) {
                width = win.bounds.width;
                height = win.bounds.height;
            }
        }
        return { width, height };
    }
    async handleWebrtc() {
        let { sources } = this;
        if (sources.length === 0) {
            sources = await new AppAPI().get_sources(['window', 'screen']);
        }
        const screenSource = sources.find((row: { id: string }) => row.id === this.winId);

        const { width, height } = await this.getBounds();
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                ...({
                    mandatory: {
                        minWidth: width,
                        minHeight: height,
                        minFrameRate: 30,
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: screenSource!.id
                    }
                } as any)
            }
        });

        const videoElement = document.getElementById(getVideoId(screenSource)) as HTMLVideoElement;

        
        if (!this.peerConnection || this.peerConnection.signalingState == 'closed') {
            this.peerConnection = new RTCPeerConnection({
                // iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
        }
        videoElement!.srcObject! = stream;
        stream.getTracks().forEach(track => {
            const sender = this.peerConnection.addTrack(track, stream);

            // 设置码率
            const params = sender.getParameters();
            if (!params.encodings) params.encodings = [{}];

            params.encodings[0].maxBitrate = 5_000_000; // 5Mbps
            params.encodings[0].maxFramerate = 30;
            sender.setParameters(params);
        });
        
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", this.peerConnection.iceConnectionState);
            updateApp();
        };
        
        this.peerConnection.onconnectionstatechange = () => {
            console.log("Connection State:", this.peerConnection.connectionState);
            updateApp();
        };
        
        this.peerConnection.onsignalingstatechange = () => {
            console.log("Signaling State:", this.peerConnection.signalingState);
            updateApp();
        };

        this.dataChannel_control = this.peerConnection.createDataChannel('control');

        this.dataChannel_control.onopen = async () => {
            updateApp()
            this.dataChannel_control!.send(
                JSON.stringify({ deviceInfo: await this.getDeviceInfo() })
            );
        };
        this.dataChannel_control.onmessage = async e => {
            console.log('dataChannel_control', e.data);
            const payload = JSON.parse(e.data)

            const { x, y } = await this.getBounds();
            if (payload.x !== undefined) {
                payload.x = x + payload.x;
            }
            if (payload.y !== undefined) {
                payload.y = y + payload.y;
            }
            WebSocketCtlClient.sendJsonMessage(payload);
        };
        this.dataChannel_control.onclose = () => {
            updateApp()
        };
        this.dataChannel_chat = this.peerConnection.createDataChannel('chat');

        this.dataChannel_chat.onopen = () => {
            updateApp()
        };
        this.dataChannel_chat.onmessage = e => console.log('Received:', e.data);

        this.dataChannel_chat.onclose = () => {
            updateApp()
        };

        this.dataChannel_screen = this.peerConnection.createDataChannel('screen');

        this.dataChannel_screen.onopen = () => {
            updateApp()
        };
        this.dataChannel_screen.onclose = () => {
            updateApp()
        };

        this.dataChannel_screen.onmessage = e => console.log('Received:', e.data);

        this.peerConnection.onicecandidate = event => {
            updateApp()
            if (event.candidate) {
                // console.log(">>>>>>>>>>> candidate send ",JSON.stringify(event.candidate))
                this.sendJsonMessage({
                    action: 'deviceMsg',
                    payload: {
                        candidate: event.candidate
                    }
                });
            }
        };
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
      
        // console.log(">>>>>>>>>>> offer send ",JSON.stringify(offer))
        this.sendJsonMessage({
            action: 'deviceMsg',
            payload: {
                offer
            }
        });
    }

    async getSource() {
        let { sources } = this;

        if (sources.length === 0) {
            sources = await new AppAPI().get_sources(['window', 'screen']);
        }

        const screenSource = sources.find((row: { id: string }) => row.id === this.winId);
        return screenSource;
    }
    async getBounds() {
        const screenSource = await this.getSource();
        if (screenSource?.display_id) {
            return { x: 0, y: 0, width: window.screen.width, height: window.screen.height };
        }
        const windows = WebSocketCtlClient.getWindows();

        const win = windows.find(row => row.title === screenSource!.name);
        const { x, y, width, height } = win.bounds;
        return { x, y, width, height };
    }
    async init() {
        const device = new DesktopDevices(this.winId);
        device.setConnected(DeviceConnect.Connecting);
        const ws = new WebSocket(this.url);
        ws.binaryType = 'arraybuffer';
        this.socket = ws;

        ws.onopen = async () => {
            console.log('WebSocket connection established.');
            device.setConnected(DeviceConnect.Connected);
            const { x, y, width, height } = await this.getBounds();
            const dpi = window.devicePixelRatio * 96; // 96 is the standard DPI for most screens

            ws.send(
                JSON.stringify({
                    action: 'registerDevice',
                    payload: {
                        screen:{
                            x,
                            y,
                            width,
                            height,
                            dpi
                        },
                        deviceId: this.deviceId,
                        password: this.passwordHash,
                        platform: isMac() ? 'darwin' : 'win32'
                    }
                })
            );

            const t = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    this.sendJsonMessage({ ping: 1 });
                } else {
                    clearInterval(t);
                }
            }, 5000);
        };

        ws.onmessage = async event => {
            // console.log('Message received:', event.data);
            const { action, payload } = JSON.parse(event.data as string);
            if (action === 'clientMsg') {
                const { eventType, answer, candidate } = payload;

                switch (eventType) {
                    case 'deviceInfo': {
                        console.log('deviceInfo');
                        device.setDevideInfo({clientConnected:true})
                        const deviceInfo = await this.getDeviceInfo();
                        this.sendJsonMessage({
                            action: 'deviceMsg',
                            payload: {
                                deviceInfo
                            }
                        });
                        device.setServiceMediaIsRunning(true);
                        this.handleWebrtc();
                        return;
                    }

                    case 'answer': {
                        await this.peerConnection.setRemoteDescription(
                            new RTCSessionDescription(answer)
                        );
                        return;
                    }

                    case 'candidate': {
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                        return;
                    }
                    case 'stopPushingImage': {
                        this.stopVideo();
                        device.setDevideInfo({clientConnected:false})
                        device.setServiceMediaIsRunning(false);
                        return;
                    }
                    default: {
                        const { x, y } = await this.getBounds();
                        if (payload.x !== undefined) {
                            payload.x = x + payload.x;
                        }
                        if (payload.y !== undefined) {
                            payload.y = y + payload.y;
                        }
                        WebSocketCtlClient.sendJsonMessage(payload);
                        return;
                    }
                }
            }
        };

        ws.onclose = ({ code, reason }) => {
            device.setDevideInfo({clientConnected:false})
            device.setServiceMediaIsRunning(false);
            this.stopVideo();
            console.log('WebSocket connection closed.');
            if (code !== WsCloseCode.WS_CLOSE_STOP_RECONNECT) {
                setTimeout(() => {
                    this.retry_count += 1;
                    if (this.retry_count < 10) {
                        this.init();
                    } else {
                        this.retry_count = 0;
                        device.setConnected(DeviceConnect.Closed);
                    }
                }, 1000);
            } else {
                this.retry_count = 0;
                device.setConnected(DeviceConnect.Inited);
            }
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error);
        };
    }
    async getDeviceInfo() {
        let { sources } = this;
        if (sources.length === 0) {
            sources = await new AppAPI().get_sources(['window', 'screen']);
        }

        // const sources = await new AppAPI().get_sources(['window', 'screen']);
        const screenSource = sources.find((row: { id: string }) => row.id === this.winId);
        const { width, height } = this.getWindowSize(screenSource!);

        const devicePixelRatio = window.devicePixelRatio;
        const dpi = 96 * devicePixelRatio;
        //@ts-ignore
        const platform = window.backgroundApi.platform();
        //@ts-ignore
        const arch = window.backgroundApi.arch();
        return {
            inputIsOpen: !!WebSocketCtlClient.inputIsOpen(),
            mediaIsStart: true,
            compressQuality: 1,
            delaySendImageDataMs: 1000,
            delayPullEventMs: 1000,
            platform,
            arch,
            screen: {
                height,
                width,
                scale: devicePixelRatio,
                //todo fix
                dpi
            }
        };
    }
    isOpen() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    isClosed() {
        return this.socket && this.socket.readyState === WebSocket.CLOSED;
    }
    sendJsonMessage(json: any) {
        this.sendMessage(JSON.stringify(json));
    }
    sendMessage(message: string | any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }

    close(): void {
        this.socket && this.socket.close();
    }
}
