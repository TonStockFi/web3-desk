let TcRootObserved = false;

export function observeTcRoot() {
    if (TcRootObserved) {
        return;
    }
    TcRootObserved = true;
    const tcRoot = document.querySelector('#tc-widget-root');
    //console.debug('observeTcRoot');
    new MutationObserver((mutationsList: any[]) => {
        for (const mutation of mutationsList) {
            const button = document.querySelector(
                '#tc-widget-root button[lefticon="true"][righticon="true"]'
            ) as HTMLButtonElement;
            if (mutation.type === 'childList' && button) {
                //console.debug('observeTcRoot', mutation.type, button);
                if (button.style.display !== 'none') {
                    button.style.display = 'none';
                }

                const liList = document.querySelectorAll(
                    '#tc-widget-root button[data-tc-wallet-item="true"]'
                );
                if (liList.length > 1) {
                    const parent = liList[0].parentElement.parentElement;
                    let i = 0;
                    for (const child of parent.children) {
                        if (i === 0) {
                            const node = child as HTMLElement
                            node.style.display = 'flex';
                            node.style.width = '100%';
                            node.style.alignItems = node.style.justifyContent = 'center';
                        } else {
                            parent.removeChild(child); // Remove the child element
                        }
                        i += 1;
                    }
                }
            }
        }
    }).observe(tcRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
}

