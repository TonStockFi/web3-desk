import { aesGcmEncryptBuffer } from '@web3-explorer/lib-crypto/dist/AESService';
import screenshot from 'screenshot-desktop';

import WebSocket from 'ws';

import { MainWindow } from '../mainWindow';

import { Action } from './action';
import { WsCloseCode } from './server';

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
let wsClientCtl: null | WebSocketClient = null;
// let wsClientFile: null | WebSocketClient = null;
let retry_count = 0;
export let client_is_ready = false;
export function set_client_is_ready(v: boolean) {
    client_is_ready = v;
    if (!client_is_ready) {
        startPushingImage = false;
    }
    wsClientCtl = null
}
setInterval(() => {
    if (
        wsClient &&
        wsClient.isOpen() &&
        client_is_ready &&
        wsClient.getPassword() &&
        startPushingImage
    ) {
        screenshot()
            .then(async (img: any) => {
                const encryptData = await aesGcmEncryptBuffer(img, wsClient.getPassword());
                // console.log('plain', 'imgLen:', startPushingImage);

                // Resize the image using sharp
                //    sharp(img)
                //    .resize(1280) // Resize to 800x600
                //    .toFile("shot-resized.jpg") // Save the resized image
                //    .then(() => {
                //        console.log("Resized screenshot saved as 'shot-resized.jpg'");
                //    })
                //    .catch((resizeError) => {
                //        console.error("Error resizing screenshot:", resizeError);
                //    });
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
            })
            .catch((err: any) => {
                console.error(err);
            });
    }
}, 800);

class WebSocketClient {
    private socket: WebSocket;
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
                        platform: 'macOS'
                    }
                })
            );
        };

        ws.onmessage = async event => {
            console.log('Message received:', event.data);
            const { action, payload } = JSON.parse(event.data as string);
            if (action === 'clientMsg') {
                const action = new Action()
                
                const { eventType,x,y } = payload;
                
                switch (eventType) {
                    case 'deviceInfo': {
                        startPushingImage = true;
                        const deviceInfo = await MainWindow.getDeviceInfo();
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
                    case 'click': {
                        action.process({
                            eventType:"click",
                            x,y
                        })
                        return;
                    }
                    case 'rightClick': {
                        action.process({
                            eventType:"rightClick",
                            x,y
                        })
                        return;
                    }
                }
            }
        };

        ws.onclose = ({ code, reason }) => {
            console.log('WebSocket connection closed.');
            if(code !== WsCloseCode.WS_CLOSE_STOP_RECONNECT){
                setTimeout(() => {
                    retry_count += 1;
                    if (retry_count < 10) {
                        this.init();
                    } else {
                        MainWindow.mainWindow.webContents.executeJavaScript(
                            `window.AppCallback(${JSON.stringify({
                                action: 'stop_retry_ws',
                                payload: {}
                            })})`
                        );
                    }
                }, 1000);
            }
           
        };

        ws.onerror = error => {
            console.error('WebSocket error:', error.message);
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
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }

    close(): void {
        this.socket.close();
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
            console.log('==========');
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
                        return wsClient.isClosed();
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
                        return wsClientCtl.isClosed();
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
