import { WS_CTL_URL } from "../../constant";

export let wsPyCtlClient: null | WebSocketCtlClient = null;
let windows: any[] = [];

export default class WebSocketCtlClient {
    static initClient() {
        wsPyCtlClient = new WebSocketCtlClient(WS_CTL_URL);
    }
    static getWsPyCtlClient(){
        return wsPyCtlClient;
    }
    static inputIsOpen(){
        return Boolean(wsPyCtlClient && wsPyCtlClient.isOpen())
    }
    static getWindows(){
        return windows;
    }
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
            try {
                const { action, payload } = JSON.parse(event.data);
                switch (action) {
                    case 'onGetWindows':
                        windows = payload.windows;
                        break;

                    default:
                        break;
                }
            } catch (error) {}
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
    static sendJsonMessage(json: any) {
        if(wsPyCtlClient && wsPyCtlClient.isOpen()){
            wsPyCtlClient.sendMessage(JSON.stringify(json));
        }else{
            console.error("wsPyCtlClient is not open")
        }
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
