import { sendMessageToMain } from "./utils";
let PortalsObserved = false;

export const tgCallback = (message: { action: string; payload: never }) => {
    console.debug('render callback', message);
    switch (message.action){
        case "tgLogged":
            loading_getTgGlobalState = false
            tgLogged = true;

            break;
        case "tgLogout":
            localStorage.removeItem('user_auth')
            localStorage.clear()
            location.reload();
            tgCallback(message)
            break;
        default:
            break;
    }
};
export function observePortals() {
    if (PortalsObserved) {
        return;
    }
    PortalsObserved = true;
    const portals = document.querySelector('#portals');
    console.debug('observePortals');
    new MutationObserver((mutationsList: any[]) => {
        for (const mutation of mutationsList) {
            //console.debug('observePortals', mutation.type);
            if (mutation.type === 'childList') {
                const iframe = portals.querySelector('iframe');
                if (iframe && iframe.src && iframe.src !== 'about:blank') {
                    sendMessageToMain('onTgWebIframe', { url: iframe.src });
                }

                const button = document.querySelector("#portals .confirm-dialog-button");
                if(button){
                    sendMessageToMain('onTgWebIframeConfirm', {});
                }
                
            }
        }
    }).observe(portals, {
        childList: true,
        subtree: true
    });
}

let tgLogged = false;

async function getTgGlobalState() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('tt-data', 1);
        request.onsuccess = (event) => {
            const db = request.result;
            const transaction = db.transaction(['store'], 'readonly');
            const objectStore = transaction.objectStore('store');
            const getRequest = objectStore.get('tt-global-state'); // replace 'yourKey' with your actual key
            getRequest.onsuccess = (event:any) => {
                resolve(event.target.result);
            };
            getRequest.onerror = (event) => {
                reject('Error retrieving data from IndexedDB');
            };
        };
        request.onerror = (event) => {
            reject('Error opening IndexedDB');
        };
    });
}
let loading_getTgGlobalState = false;

export function observeTgWebSite() {
    const user_auth = JSON.parse(localStorage.getItem('user_auth') || '{}');
    console.debug("tgLogged:",tgLogged,user_auth);
    if (user_auth.dcID && user_auth.id) {
        if (!tgLogged) {
            if(loading_getTgGlobalState){
                return
            }
            loading_getTgGlobalState = true;
            getTgGlobalState().then((state:any)=>{
                if(state && state.users && state.users.byId && state.users.byId[user_auth.id]){
                    const user = state.users.byId[user_auth.id];
                    console.log("send event: onTgWebLogged",user)
                    sendMessageToMain('onTgWebLogged', { user });
                }else{
                    loading_getTgGlobalState = false
                }
            }).catch(e=>{
                loading_getTgGlobalState = false
            })
        }

        const portals = document.querySelector('#portals');
        if (portals) {
            observePortals();
        }else{
            PortalsObserved = false
        }
    } else {
        if (tgLogged) {
            sendMessageToMain('onTgWebLogout');
            tgLogged = false;
        }
    }
}

export function observeTMEWebSite() {
    const tgme_action_web_button = document.querySelector(".tgme_action_web_button")
    const tgme_action_button_new = document.querySelector(".tgme_action_button_new")
    const tgme_head_right_btn = document.querySelector(".tgme_head_right_btn")
    const tgme_head_brand = document.querySelector(".tgme_head_brand")
    if(tgme_head_brand){
        //@ts-ignore
        tgme_head_brand.href = "#"
    }
    if(tgme_head_right_btn){
        //@ts-ignore
        tgme_head_right_btn.style.display = "none"
    }
    if(tgme_action_button_new){
        //@ts-ignore
        tgme_action_button_new.style.display = "none"
    }

    console.log("observeTMEWebSite",tgme_action_web_button)
}