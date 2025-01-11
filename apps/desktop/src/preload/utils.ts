import { ipcRenderer } from 'electron';

export function sendMessageToMain(
    action: 'onTgWebLogged' | 'onTgWebLogout' | 'onTgWebIframe' | 'onTgWebIframeConfirm',
    payload?: never | {url:string} | {user:any} | {}
) {
    ipcRenderer.invoke('siteMessage', { action, payload });
}
