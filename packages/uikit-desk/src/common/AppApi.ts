import { isDesktop } from "./utils";


export default class AppAPI {
    private api: any;
    constructor() {
        if(isDesktop()){
            //@ts-ignore
            this.api = window.backgroundApi
        }else{
            //@ts-ignore
            this.api = window.__AndroidAPI
        }
    }

    webview_is_ready(apiUrl: boolean, deviceId: string) {
        return this.api.webview_is_ready(apiUrl, deviceId);
    }

    check_service() {
        return this.api.check_service();
    }

    init_service(apiUrl: string, password: string, passwordHash: string) {
        return this.api.init_service(apiUrl, password, passwordHash);
    }

    stop_service() {
        return this.api.stop_service();
    }

    start_action(action: 'android.settings.ACCESSIBILITY_SETTINGS') {
        return this.api.start_action(action);
    }

    stop_input() {
        return this.api.stop_input();
    }

    start_scanner() {
        return this.api.start_scanner();
    }

    show_toast(msg: string) {
        return this.api.show_toast(msg);
    }

    open_url(url: string) {
        return this.api.open_url(url);
    }

    //desktop only
    check_state() {
        return this.api.check_state();
    }

    async get_env() {
        return this.api.get_env();
    }
    start_server(port:number) {
        return this.api.start_server(port);
    }
    stop_server() {
        return this.api.stop_server();
    }
    server_is_ready() {
        return this.api.server_is_ready();
    }

    open_screen_recording_settings() {
        return this.api.open_screen_recording_settings();
    }
}
