import { aesGcmEncryptBuffer } from '@web3-explorer/lib-crypto/dist/AESService';
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

    constructor(url: string, deviceId: String, password: string, passwordHash: string) {
        this.url = url;
        this.deviceId = deviceId;
        this.password = password;
        this.passwordHash = passwordHash;
        this.init();
    }
    getPasswordHash() {
        return this.passwordHash;
    }

    getPassword() {
        return this.password;
    }

    async init() {
        const ws = new WebSocket(this.url);
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
                const { eventType } = payload;

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
let videoElement: null | HTMLVideoElement = null;
let canvas: null | HTMLCanvasElement = null;
function isVideoPlaying(video: HTMLVideoElement): boolean {
    return !video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
}

export default function DesktopPage() {
    const getScreen = async () => {
        const sources = await new AppAPI().get_sources(['window', 'screen']);
        const screenSource = sources[0];
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                ...({
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: screenSource.id
                    }
                } as any)
            }
        });

        videoElement = document.getElementById('canvas_screen') as HTMLVideoElement;
        if (!videoElement) {
            console.error('Video element not found!');
            return;
        }
        videoElement.srcObject = stream;
        videoElement.play();
    };
    useTimeoutLoop(async () => {
        if (
            videoElement &&
            isVideoPlaying(videoElement) &&
            wsClient &&
            wsClient &&
            wsClient.isOpen() &&
            client_is_ready &&
            wsClient.getPassword() &&
            startPushingImage
        ) {
            if (!canvas) {
                canvas = document.getElementById('canvas_screen_copy') as HTMLCanvasElement;
                if (!canvas) {
                    return;
                }
            }
            const context = canvas.getContext('2d');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            if (!context) {
                return;
            }
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise<Blob | null>(resolve =>
                canvas!.toBlob(
                    blob => resolve(blob),
                    'image/jpeg',
                    0.95 // Quality: 0.8
                )
            );

            if (!blob) {
                console.error('Failed to create Blob from canvas.');
                return;
            }
            const buffer = await blob.arrayBuffer();
            const encryptData = await aesGcmEncryptBuffer(
                Buffer.from(buffer),
                wsClient.getPassword()
            );

            const dataUri = `data:jpeg;base64_a${wsClient
                .getPasswordHash()
                .substring(0, 4)},${encryptData}`;
            wsClient.sendMessage(
                JSON.stringify({
                    action: 'deviceMsg',
                    payload: {
                        screenImage: {
                            data: dataUri,
                            ts: +new Date()
                        }
                    }
                })
            );
            // wsClient.sendMessage(
            //     JSON.stringify({
            //         action: 'close',
            //         payload: {
            //             code: WsCloseCode.WS_CLOSE_STOP_RECONNECT,
            //             reason: 'WS_CLOSE_STOP_RECONNECT'
            //         }
            //     })
            // );

            // const frameDataURL = canvas.toDataURL('image/jpeg', 0.8); // Quality: 0.8
            // // Display the frame data as an image for debugging
            // const imgElement = document.getElementById('screen_img') as HTMLImageElement;
            // if (imgElement) {
            //     imgElement.src = frameDataURL;
            // }
        }
    }, 100);

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
                await getScreen();
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

                console.log('screen closing');
                await waitForResult(() => {
                    return !wsClient || wsClient.isClosed();
                });
            }

            set_client_is_ready(false);
            AppAPI.isWsConnected = false;
            AppAPI.isWsReady = false;
            AppAPI.client_is_ready = false;
            if (videoElement) {
                videoElement.pause();
            }
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
            <View>
                <AppInner></AppInner>
            </View>
            <View column displayNone>
                <View wh={800}>
                    <img style={{ maxWidth: '100%' }} id="screen_img"></img>
                    <video
                        style={{ maxWidth: '100%', display: 'block' }}
                        id="canvas_screen"
                    ></video>
                    <canvas style={{ display: 'none' }} id="canvas_screen_copy"></canvas>
                </View>
            </View>
        </View>
    );
}
