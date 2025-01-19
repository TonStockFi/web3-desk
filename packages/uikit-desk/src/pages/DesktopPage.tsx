import WindowIcon from '@mui/icons-material/Window';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useLocalStorageState } from '@web3-explorer/utils';
import { useEffect, useState } from 'react';
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
    useEffect(() => {
        if (!wsPyCtlClient) {
            new AppAPI().open_ctl_server();
            wsPyCtlClient = new WebSocketCtlClient('ws://127.0.0.1:6790');
        }
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
                    await new Promise(resolve => (videoElement!.onloadedmetadata = resolve));
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
    const leftActions = [
        {
            icon: 'Link',
            name: '连接'
        },
        {
            icon: <WindowIcon></WindowIcon>,
            name: '桌面'
        }
    ];
    const [curentPage, setCurrentPage] = useLocalStorageState('curentPage', 0);

    return (
        <View>
            <View absFull position={'fixed'} left={0} w={52} bgColor="#1b1b1b">
                <View wh100p pt12 borderBox column aCenter>
                    {leftActions.map((leftAction, i) => {
                        return (
                            <View
                                pointer
                                onClick={() => {
                                    setCurrentPage(i);
                                }}
                                bgColor={curentPage === i ? '#3b3b3b' : ''}
                                key={leftAction.name}
                                center
                                wh={44}
                                borderRadius={4}
                                hoverBgColor={'#222224'}
                                mb12
                            >
                                <View icon={leftAction.icon}></View>
                            </View>
                        );
                    })}
                </View>
            </View>
            <View absFull position={'fixed'} left={52} displayNone={curentPage !== 0}>
                <View column displayNone>
                    <View wh={400}>
                        <video
                            style={{
                                border: '1px solid black',
                                maxWidth: '100%',
                                display: 'block'
                            }}
                            id="video"
                        ></video>
                        <img src="" id={'img'} alt="" />
                    </View>
                </View>
                <View>
                    <AppInner />
                </View>
            </View>
            <View absFull position={'fixed'} left={52} hide={curentPage !== 1}>
                <WinsView />
            </View>
        </View>
    );
}

const captureFrame = (videoElement: HTMLVideoElement) => {
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

const destroyStream = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
};

export function WinsView() {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSourceId, setCurrentSourceId] = useLocalStorageState('currentSourceId', '');

    const getScreent = async (screenSource: any, video_id: string, isThumbnail?: boolean) => {
        if (video_id === 'video_preview') {
            setLoading(true);
        }
        debugger;
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

        const videoElement = document.getElementById(video_id) as HTMLVideoElement;
        if (!videoElement) {
            destroyStream(stream);
            return;
        }
        videoElement!.srcObject! = stream;
        await new Promise(resolve => (videoElement!.onloadedmetadata = resolve));
        videoElement!.play();
        if (video_id === 'video_preview') {
            setLoading(false);
        }
        if (isThumbnail) {
            videoElement!.onplay = () => {
                const image = captureFrame(videoElement!);
                const thumbnailElement = document.getElementById(
                    video_id.replace('win', 'pic')
                ) as HTMLImageElement;
                if (thumbnailElement && image) {
                    thumbnailElement.src = image;
                }
                destroyStream(stream);
                videoElement!.srcObject = null;
            };
        }
    };
    useEffect(() => {
        new AppAPI().get_sources(['window', 'screen']).then(setSources);
    }, []);

    useEffect(() => {
        for (let index = 0; index < sources.length; index++) {
            const source = sources[index] as any;
            getScreent(source, getVideoId(source), true);
        }
    }, [sources]);

    const selectedSource = sources.find(
        (row: { id: string; name: string }) => row.id === currentSourceId
    );
    useEffect(() => {
        if (selectedSource) {
            getScreent(selectedSource, 'video_preview');
        }
    }, [selectedSource]);

    let title = '';
    if (selectedSource) {
        //@ts-ignore
        title = selectedSource.name;
    }
    return (
        <>
            <View absFull right0 left={180} top0 bottom={0} p={12} center>
                <View
                    abs
                    top={0}
                    rowVCenter
                    jSpaceBetween
                    xx0
                    h={54}
                    center
                    sx={{
                        borderBottom: '1px solid #e9e9e9'
                    }}
                >
                    <View rowVCenter pl12>
                        <View textColor="#333" hide={!selectedSource} text={title || ''}></View>
                    </View>
                </View>
                <View absFull top={54} center bgColor="#e6e6e6">
                    <View
                        borderBox
                        relative
                        center
                        overflowHidden
                        sx={{ maxHeight: 400, maxWidth: 600 }}
                    >
                        <video
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                display: loading ? 'none' : 'block'
                            }}
                            src=""
                            id={'video_preview'}
                        ></video>
                    </View>

                    <View hide={!loading} center wh100p absFull>
                        <View loading></View>
                    </View>
                </View>
            </View>
            <View
                abs
                left0
                w={180}
                top0
                bottom0
                px12
                borderBox
                overflowYAuto
                sx={{
                    borderRight: '1px solid #e9e9e9'
                }}
            >
                <View column w100p aCenter pt12>
                    {sources.map((source: any) => {
                        return (
                            <WinView
                                currentSourceId={currentSourceId}
                                onClick={() => {
                                    console.log('wsPyCtlClient', !!wsPyCtlClient);
                                    if (wsPyCtlClient) {
                                        wsPyCtlClient.sendJsonMessage({
                                            eventType: 'activeWin',
                                            winName: source.name
                                        });
                                    }
                                    setCurrentSourceId(source.id);
                                    getScreent(source, 'video_preview');
                                }}
                                source={source}
                                key={source.id}
                            ></WinView>
                        );
                    })}
                </View>
            </View>
        </>
    );
}
export function getVideoId(source: any) {
    return 'win_' + source.id.replace(/:/g, '_');
}
export function WinView({
    source,
    currentSourceId,
    onClick
}: {
    currentSourceId: string;
    source: any;
    onClick: any;
}) {
    return (
        <View
            column
            onClick={onClick}
            pointer
            borderBox
            mb12
            py={6}
            px12
            borderRadius={8}
            bgColor={currentSourceId === source.id ? 'rgba(0,0,0,0.3)' : undefined}
            sx={{
                width: 150,
                '& .MuiTypography-root ': { color: '#333' }
            }}
            // tips={source.name}
            key={source.id}
        >
            <View
                textFontSize="0.7rem"
                sx={{ textAlign: 'center' }}
                text={source.name.substring(0, 20)}
            ></View>
            <View borderBox w100p h={80} center relative>
                <View absFull center>
                    <video
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src=""
                        id={getVideoId(source)}
                    ></video>
                </View>
                <View absFull center>
                    <img
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src=""
                        id={getVideoId(source).replace('win', 'pic')}
                    ></img>
                </View>
            </View>
        </View>
    );
}
