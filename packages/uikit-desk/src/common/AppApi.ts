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

    webview_is_ready() {
        return this.api.webview_is_ready();
    }
    static pythonPath = ""
    static screenRecordingStatus:string = ""
    static  accessibilityStatus:string = ""
    static  screenRecordingIsAuthed:boolean = false
    static  client_is_ready:boolean = false
    static  isWsConnected:boolean = false
    static  isWsReady:boolean = false
    static  serviceInputIsOpen:boolean = false

    static getState(){
        return {
            screenRecordingStatus:AppAPI.screenRecordingStatus,
            accessibilityStatus:AppAPI.accessibilityStatus,
            screenRecordingIsAuthed:AppAPI.screenRecordingIsAuthed,
            mediaIsStart: AppAPI.client_is_ready,
            isWsConnected: AppAPI.isWsConnected,
            isWsReady: AppAPI.isWsReady,
            inputIsOpen: AppAPI.serviceInputIsOpen,
            serviceMediaIsRunning:AppAPI.client_is_ready, 
            connected:AppAPI.isWsReady?1:0, 
            serviceInputIsOpen:AppAPI.serviceInputIsOpen
        };
    }
    check_service() {
        if(isDesktop()){
            return JSON.stringify(AppAPI.getState())
        }
        return this.api.check_service();
    }

    init_service() {
        return this.api.init_service();
    }
    postControlEvent(payload:any){
        return this.api.postControlEvent(JSON.stringify(payload));
    }

    stop_service() {
        if(isDesktop()){
            window.dispatchEvent(new CustomEvent("stop_service",{
                detail:{}
            }))
            return 
        }
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

    get_sources(types?:string[]) {
        return this.api.get_sources(types);
    }

    get_display_bounds(id?:string) {
        return this.api.get_display_bounds(id);
    }
    run_action(payload:any,pythonPath:string) {
        return this.api.run_action(payload,pythonPath);
    }

    open_ctl_server() {
        return this.api.open_ctl_server();
    }
}
