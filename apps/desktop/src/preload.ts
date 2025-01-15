console.log("preload")
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('backgroundApi', {
    webview_is_ready:(apiUrl: string, deviceId: string)=>ipcRenderer.invoke('message', {action:"webview_is_ready",payload:{apiUrl,deviceId}}),
    start_server:(port:number)=>ipcRenderer.invoke('message', {action:"start_server",payload:{port}}),
    stop_server:()=>ipcRenderer.invoke('message', {action:"stop_server",payload:{}}),
    server_is_ready:()=>ipcRenderer.invoke('message', {action:"server_is_ready",payload:{}}),
    get_env:()=>ipcRenderer.invoke('message', {action:"get_env",payload:{}}),
    check_service:()=>ipcRenderer.invoke('message', {action:"check_service",payload:{}}),
    check_state:()=>ipcRenderer.invoke('message', {action:"check_state",payload:{}}),
    run_action:(payloadEvent:any,pythonPath:string)=>ipcRenderer.invoke('message', {action:"run_action",payload:{payloadEvent,pythonPath}}),
    stop_input:()=>ipcRenderer.invoke('message', {action:"stop_input",payload:{}}),
    get_sources:(types?:string[])=>ipcRenderer.invoke('message', {action:"get_sources",payload:{types}}),
    open_ctl_server:()=>ipcRenderer.invoke('message', {action:"open_ctl_server",payload:{}}),

    
    open_url:(url:string)=>ipcRenderer.invoke('message', {action:"open_url",payload:{url}}),
    stop_service:()=>ipcRenderer.invoke('message', {action:"stop_service",payload:{}}),
    start_scanner:()=>ipcRenderer.invoke('message', {action:"start_scanner",payload:{}}),
    show_toast:(message:string)=>ipcRenderer.invoke('message', {action:"show_toast",payload:{message}}),
    init_service:(apiUrl: string, password: string, passwordHash: string)=>ipcRenderer.invoke('message', {action:"init_service",payload:{apiUrl,password,passwordHash}}),
    start_action:(action: string)=>ipcRenderer.invoke('message', {action:"start_action",payload:{action}}),
    open_screen_recording_settings:(action: string)=>ipcRenderer.invoke('message', {action:"open_screen_recording_settings",payload:{action}}),
    get_display_bounds:(display_id: string)=>ipcRenderer.invoke('message', {action:"get_display_bounds",payload:{display_id}}),

    platform: () => process.platform,
    arch: () => process.arch,
    node: () => process.versions.node,
    chrome: () => process.versions.chromes,
    electron: () => process.versions.electron,
});
