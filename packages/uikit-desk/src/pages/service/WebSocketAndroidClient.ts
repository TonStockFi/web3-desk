import AppAPI from '../../common/AppApi';
import { updateApp } from '../../common/utils';
import { WsCloseCode } from '../../types';
import DesktopDevices, { DeviceConnect } from './DesktopDevices';

export default class WebSocketAndroidClient {
    private socket?: WebSocket;
    deviceId: String;
    password: string;

    winId: string;
    passwordHash: string;
    url: string;
    peerConnection: RTCPeerConnection;
    retry_count: number = 0;
    dataChannel_control?: RTCDataChannel;
    dataChannel_chat?: RTCDataChannel;
    dataChannel_screen?: RTCDataChannel;
    device: DesktopDevices;

    constructor(
        url: string,
        winId: string,
        deviceId: String,
        password: string,
        passwordHash: string
    ) {
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
    sendChannalScreenMessage(message: string) {
        const { dataChannel_screen } = this;
        if (dataChannel_screen && dataChannel_screen.readyState === 'open') {
            this.device.setServiceMediaIsRunning(true);
            dataChannel_screen.send(message);
        }
    }
    sendChannalControlMessage(message: string) {
        const { dataChannel_control } = this;
        if (dataChannel_control && dataChannel_control.readyState === 'open') {
            dataChannel_control.send(message);
        }
    }
    async handleWebrtc() {
        if (!this.peerConnection || this.peerConnection.signalingState == 'closed') {
            this.peerConnection = new RTCPeerConnection({
                // iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
        }
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
        this.dataChannel_control.onmessage = e => {
            console.log('dataChannel_control', e.data);
            const event = JSON.parse(e.data);
            new AppAPI().postControlEvent(event);
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

    async init() {
        console.log('WebSocketAndroidClient initClients');
        const device = new DesktopDevices(this.winId);
        device.setConnected(DeviceConnect.Connecting);
        const ws = new WebSocket(this.url);
        ws.binaryType = 'arraybuffer';
        this.socket = ws;

        ws.onopen = async () => {
            console.log('WebSocket connection established.');
            device.setConnected(DeviceConnect.Connected);
            const res = await new AppAPI().check_service();
            const deviceInfo = JSON.parse(res);
            const { dpi, width, height } = await deviceInfo.screen;
            ws.send(
                JSON.stringify({
                    action: 'registerDevice',
                    payload: {
                        screen:{
                            x:0,
                            y:0,
                            width,
                            height,
                            dpi
                        },
                        deviceId: this.deviceId,
                        password: this.passwordHash,
                        platform: 'ADR'
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
            console.log('Message received:', event.data);
            const { action, payload } = JSON.parse(event.data as string);
            if (action === 'clientMsg') {
                const { eventType, answer, candidate } = payload;

                switch (eventType) {
                    case 'deviceInfo': {
                        device.setDevideInfo({clientConnected:true})
                        const deviceInfo = await this.getDeviceInfo();
                        this.sendJsonMessage({
                            action: 'deviceMsg',
                            payload: {
                                deviceInfo
                            }
                        });
                        this.handleWebrtc();
                        return;
                    }

                    case 'answer': {
                        // console.log(">>>>>>>>>>> answer",JSON.stringify(answer))
                        await this.peerConnection.setRemoteDescription(
                            new RTCSessionDescription(answer)
                        );
                        return;
                    }

                    case 'candidate': {
                        // console.log(">>>>>>>>>>> candidate",JSON.stringify(candidate))
                        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                        return;
                    }
                    case 'stopPushingImage': {
                        device.setServiceMediaIsRunning(false);
                        return;
                    }
                    default: {
                        // WebSocketCtlClient.sendJsonMessage(payload)
                        return;
                    }
                }
            }
        };

        ws.onclose = ({ code, reason }) => {
            device.setServiceMediaIsRunning(false);
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
            console.error('WebSocket error:', JSON.stringify(error));
        };
    }

    async getDeviceInfo() {
        const platform = 'ADR';
        const arch = 'amd64';
        const res = await new AppAPI().check_service();
        const deviceInfo = JSON.parse(res);
        const { dpi, width, height } = await deviceInfo.screen;

        return {
            inputIsOpen: !!deviceInfo.inputIsOpen,
            mediaIsStart: !!deviceInfo.mediaIsStart,
            compressQuality: 1,
            delaySendImageDataMs: 1000,
            delayPullEventMs: 1000,
            platform,
            arch,
            screen: {
                height,
                width,
                scale: devicePixelRatio,
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
