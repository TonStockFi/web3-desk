import { CutAreaRect, ErrCodes, GLOBAL_ACTIONS, sendMessageParams, WsCloseCode } from "../types";

export const connectWebSocket = (
    wsUrl: string,
    options: {
        onLogged?: {
            action: string,
            payload: {
                platform?: string,
                deviceId?: string,
                password?:string
            }
        };
        onLoginError?: (message: { errCode:ErrCodes }, ws: WebSocket) => void;
        onMessage: (message: { action: string,payload:any,errCode:ErrCodes }, ws: WebSocket) => void;
        onClose: (e: { code: number; reason: string }, ws: WebSocket) => void;
    }
) => {
    return new Promise<WebSocket>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            if(options.onLogged){
                wsSendMessage(
                    options.onLogged,
                    ws
                );
            }else{
                resolve(ws)
            }
        };
        ws.onmessage = e => {
            const message = JSON.parse(e.data);
            const {action,errCode} = message;
            if (action === 'logged') {
                resolve(ws);
            }if (action === 'loginError') {
                if(options.onLoginError){
                    options.onLoginError(message,ws)
                }
                reject(new Error(errCode));
            }else{
                options.onMessage(message, ws)
            }
        };
        ws.onerror = error => {
            reject({
                ws,
                message:null,
                error
            });
        };
        ws.onclose = e => options.onClose(e, ws);
    });
};

export const isWs_OPEN = (ws?: WebSocket) => {
    return ws && ws.readyState === WebSocket.OPEN;
};

export const isWs_CONNECTING = (ws?: WebSocket) => {
    return ws && ws.readyState === WebSocket.CONNECTING;
};

export const wsSendMessage = (message: any, ws?: WebSocket) => {
    if (isWs_OPEN(ws)) {
        ws!.send(JSON.stringify(message));
    } else {
        console.error(`wsSendMessage error: ${!ws ? 'ws is null' : ws.readyState}`);
    }
};

export const wsSendClientEvent = (eventMessage: sendMessageParams, ws?: WebSocket) => {
    wsSendMessage(
        {
            action: 'clientMsg',
            payload: eventMessage
        },
        ws
    );
    sendLogEvent({ event: eventMessage });
};

export const wsSendClientEventAction = (action: GLOBAL_ACTIONS, ws?: WebSocket) => {
    wsSendMessage(
        {
            action: 'clientMsg',
            payload: {
                eventType: 'action',
                value: action
            }
        },
        ws
    );
};


export const wsSendClose = (code: WsCloseCode, reason: string, ws: WebSocket) => {
    wsSendMessage(
        {
            action: 'close',
            payload: {
                code,
                reason: reason || 'close'
            }
        },
        ws
    );
};
export const wsSendClientClickEvent = (x: number, y: number, ws?: WebSocket) => {
    x = Math.round(x);
    y = Math.round(y);
    wsSendMessage(
        {
            action: 'clientMsg',
            payload: {
                eventType: 'click',
                x,
                y
            }
        },
        ws
    );
    sendLogEvent({
        event: { eventType: 'click', x, y }
    });
};

export function sendLogEvent(message: { cutArea?: CutAreaRect; event?: sendMessageParams }) {
    window.dispatchEvent(
        new CustomEvent('LogEvent', {
            detail: message
        })
    );
}

