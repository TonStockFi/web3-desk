import { View } from '@web3-explorer/uikit-view/dist/View';
import { useTimeoutLoop } from '@web3-explorer/utils';
import { useEffect } from 'react';

import { default as AppAPI } from '../common/AppApi';

import { isMac } from '../common/utils';
import { WsCloseCode } from '../types';
import { AppInner, KEY_DEVICE_ID } from './MobileDeviceApp';

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

let startPushingImage = false;
export let wsClient: null | WebSocketClient = null;
export let wsPyCtlClient: null | WebSocketCtlClient = null;
let wsClientCtl: null | WebSocketClient = null;
// let wsClientFile: null | WebSocketClient = null;
let retry_count = 0;
export let client_is_ready = false;
export function set_client_is_ready(v: boolean) {
    client_is_ready = v;
    if (!client_is_ready) {
        startPushingImage = false;
    }
    wsClientCtl = null;
}

function getDeviceInfo() {
    const { inputIsOpen } = AppAPI.getState();
    const { width, height } = window.screen;
    const devicePixelRatio = window.devicePixelRatio;
    const dpi = 96 * devicePixelRatio;
    //@ts-ignore
    const platform = window.backgroundApi.platform();

    //@ts-ignore
    const arch = window.backgroundApi.arch();
    return {
        inputIsOpen,
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

class WebSocketClient {
    private socket?: WebSocket;
    deviceId: String;
    password: string;
    passwordHash: string;
    url: string;
    peerConnection: RTCPeerConnection;

    constructor(url: string, deviceId: String, password: string, passwordHash: string) {
        this.url = url;
        this.deviceId = deviceId;
        this.password = password;
        this.passwordHash = passwordHash;
        this.peerConnection = new RTCPeerConnection();

        this.init();
    }
    getPasswordHash() {
        return this.passwordHash;
    }

    getPassword() {
        return this.password;
    }

    async handleScreen() {
        const sources = await new AppAPI().get_sources(['window', 'screen']);
        const screenSource = sources[0];
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                ...({
                    mandatory: {
                        minWidth: 1920,
                        minHeight: 1080,
                        minFrameRate: 30,
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: screenSource.id
                    }
                } as any)
            }
        });

        const videoElement = document.getElementById('video') as HTMLVideoElement;

        stream.getTracks().forEach(track => {
            const sender = this.peerConnection.addTrack(track, stream);

            // 设置码率
            const params = sender.getParameters();
            if (!params.encodings) params.encodings = [{}];

            params.encodings[0].maxBitrate = 5_000_000; // 5Mbps
            params.encodings[0].maxFramerate = 30;
            sender.setParameters(params);
        });
        // 处理 ICE 连接
        this.peerConnection.onicecandidate = event => {
            if (event.candidate) {
                wsClient!.sendJsonMessage({
                    action: 'deviceMsg',
                    payload: {
                        candidate: event.candidate
                    }
                });
            }
        };
        // 创建 SDP offer 并发送
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        wsClient!.sendJsonMessage({
            action: 'deviceMsg',
            payload: {
                offer
            }
        });

        videoElement!.srcObject! = stream;
        // await new Promise(resolve => (videoElement!.onloadedmetadata = resolve));
        // videoElement!.play();
    }
    async init() {
        const ws = new WebSocket(this.url);
        ws.binaryType = 'arraybuffer';
        this.socket = ws;

        ws.onopen = () => {
            console.log('WebSocket connection established.');
            ws.send(
                JSON.stringify({
                    action: 'registerDevice',
                    payload: {
                        deviceId: this.deviceId,
                        password: this.passwordHash,
                        platform: isMac() ? 'macOS' : 'win'
                    }
                })
            );
        };

        ws.onmessage = async event => {
            console.log('Message received:', event.data);
            const { action, payload } = JSON.parse(event.data as string);
            if (action === 'clientMsg') {
                const { eventType, answer, candidate } = payload;

                switch (eventType) {
                    case 'deviceInfo': {
                        startPushingImage = true;
                        const deviceInfo = getDeviceInfo();
                        this.sendJsonMessage({
                            action: 'deviceMsg',
                            payload: {
                                deviceInfo
                            }
                        });
                        this.handleScreen();
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
                        startPushingImage = false;
                        return;
                    }
                    default: {
                        wsPyCtlClient?.sendJsonMessage(payload);
                        // await new AppAPI().run_action(payload, AppAPI.pythonPath);
                        return;
                    }
                }
            }
        };

        ws.onclose = ({ code, reason }) => {
            console.log('WebSocket connection closed.');
            if (code !== WsCloseCode.WS_CLOSE_STOP_RECONNECT) {
                setTimeout(() => {
                    retry_count += 1;
                    if (retry_count < 10) {
                        this.init();
                    } else {
                        //@ts-ignore
                        window['AppCallback']({
                            action: 'stop_retry_ws'
                        });
                    }
                }, 1000);
            }
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error);
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

class WebSocketCtlClient {
    private socket?: WebSocket;
    url: string;

    constructor(url: string) {
        this.url = url;
        this.init();
    }

    async init() {
        const ws = new WebSocket(this.url);
        this.socket = ws;

        ws.onopen = () => {
            console.log('WebSocket connection established.');
        };

        ws.onmessage = async event => {
            console.log('Message received:', event.data);
        };

        ws.onclose = ({ code, reason }) => {
            console.log('WebSocket connection closed.');
            setTimeout(() => {
                this.init();
            }, 1000);
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error);
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

export async function initClients(
    apiUrl: string,
    deviceId: string,
    password: string,
    passwordHash: string
) {
    retry_count = 0;
    const urls = apiUrl.split('\n');
    console.log('initClients', { urls, deviceId, password, passwordHash });
    if (!wsPyCtlClient) {
        new AppAPI().open_ctl_server();
        wsPyCtlClient = new WebSocketCtlClient('ws://127.0.0.1:6790');
    }
    try {
        for (let index = 0; index < urls.length; index++) {
            let url = urls[index];
            url = url.trim();
            if (index === 0) {
                console.log('init_service screen', index, deviceId, url);
                if (wsClient && wsClient.isOpen()) {
                    wsClient.sendMessage(
                        JSON.stringify({
                            action: 'close',
                            payload: {
                                code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                                reason: 'WS_CLOSE_STOP_RECONNECT'
                            }
                        })
                    );
                    console.log('screen closing');
                    await waitForResult(() => {
                        return !wsClient || wsClient.isClosed();
                    });
                    wsClient = null;
                    console.log('screen closed');
                }
                console.log('screen is openning', deviceId, password, passwordHash);
                wsClient = new WebSocketClient(url, deviceId, password, passwordHash);
                console.log('screen opened');
            }
            if (index === 1) {
                console.log('init_service ctl', index, deviceId, url);
                if (wsClientCtl && wsClientCtl.isOpen()) {
                    wsClientCtl.sendMessage(
                        JSON.stringify({
                            action: 'close',
                            payload: {
                                code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                                reason: 'WS_CLOSE_STOP_RECONNECT'
                            }
                        })
                    );
                    console.log('ctl closing');
                    await waitForResult(() => {
                        return !wsClientCtl || wsClientCtl.isClosed();
                    });
                    wsClientCtl = null;
                    console.log('ctl closed');
                }
                console.log('ctl is openning');
                wsClientCtl = new WebSocketClient(url, deviceId, password, passwordHash);
                console.log('ctl openned');
            }
        }
        client_is_ready = true;
    } catch (e) {
        client_is_ready = false;
        console.error('initClients error', e);
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function DesktopPage() {
    useTimeoutLoop(async () => {
        const getData = () => {
            return new Promise(resolve => {
                // Wait for the video to be playing, then draw the video frame to the canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const videoElement = document.getElementById('video') as HTMLVideoElement;

                // Set canvas dimensions to match the video frame
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;

                // Draw the current frame from the video to the canvas
                context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                // Convert the canvas to an image (Base64 encoded PNG)
                canvas.toBlob(
                    async blob => {
                        resolve(await blob?.arrayBuffer());
                    },
                    'image/jpeg',
                    0.9
                );
            });
        };
        if (wsClient && startPushingImage) {
            const res = await getData();
            wsClient?.sendMessage(res);
        }
    }, 200);

    useEffect(() => {
        async function init_service(e: any) {
            const { apiUrl, password, passwordHash } = e.detail;
            const r = localStorage.getItem(KEY_DEVICE_ID);
            if (r) {
                const deviceId = JSON.parse(r)[0];
                await initClients(apiUrl, deviceId, password, passwordHash);
                AppAPI.isWsConnected = true;
                AppAPI.isWsReady = true;
                AppAPI.client_is_ready = true;
                // @ts-ignore
                window['AppCallback']({
                    action: 'on_state_changed'
                });
            }
        }

        async function stop_service() {
            if (wsClient && wsClient.isOpen()) {
                wsClient.sendMessage(
                    JSON.stringify({
                        action: 'close',
                        payload: {
                            code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
                            reason: 'WS_CLOSE_STOP_RECONNECT'
                        }
                    })
                );
                const videoElement = document.getElementById('video') as HTMLVideoElement;

                if (videoElement) {
                    videoElement!.play();
                }

                console.log('screen closing');
                await waitForResult(() => {
                    return !wsClient || wsClient.isClosed();
                });
            }

            set_client_is_ready(false);
            AppAPI.isWsConnected = false;
            AppAPI.isWsReady = false;
            AppAPI.client_is_ready = false;
            // if (videoElement) {
            //     videoElement.pause();
            // }
            // @ts-ignore
            window['AppCallback']({
                action: 'on_state_changed'
            });
        }
        window.addEventListener('init_service', init_service);
        window.addEventListener('stop_service', stop_service);
        return () => {
            window.removeEventListener('init_service', init_service);
            window.removeEventListener('stop_service', stop_service);
        };
    }, []);

    return (
        <View absFull position={'fixed'}>
            <View column displayNone>
                <View wh={400}>
                    <video
                        style={{ border: '1px solid black', maxWidth: '100%', display: 'block' }}
                        id="video"
                    ></video>
                    <img src="" id={'img'} alt="" />
                </View>
            </View>
            <View>
                <AppInner />
            </View>
        </View>
    );
}
