import { observeTgWebSite, observeTMEWebSite, tgCallback } from "./telegram";
import { observeTcRoot } from "./ton-connect";

const observeBody1 = ()=>{
    const tcRoot = document.querySelector('#tc-widget-root');
    if (tcRoot) {
        observeTcRoot();
    }
    if (location.hostname.indexOf('web.telegram') > -1) {
        observeTgWebSite();
    }
    
}
export function observeBody() {
    console.debug('observeBody');

    if (location.hostname.indexOf('t.me') > -1) {
        observeTMEWebSite();
    }
    observeBody1()
    new MutationObserver((mutationsList: any[]) => {
        for (const mutation of mutationsList) {
            console.debug('observeBody', mutation.type,location.hostname);
            if (mutation.type === 'childList') {
                observeBody1()
            }
        }
    }).observe(document.body, {
        childList: true,
        subtree: true
    });
}

export const callback = (message: { action: string; payload: never }) => {
    console.debug('render callback', message);
    switch (message.action){
        case "tgLogged":
        case "tgLogout":
            tgCallback(message)
            break;
        default:
            break;
    }
};