import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect } from 'react';
import { default as AppAPI } from '../common/AppApi';

import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { waitForResult } from '../common/utils';
import { WS_URL } from '../constant';
import { WsCloseCode } from '../types';
import { DesktopWindowsView } from './DesktopWindowsView';

import { useTimeoutLoop } from '@web3-explorer/utils';
import { useScreenShareContext } from './ScreenShareProvider';
import DesktopDevices, {
    DeviceConnect,
    Devices,
    loadDevices,
    saveDevices
} from './service/DesktopDevices';
import WebSocketClient from './service/WebSocketClient';
import WebSocketCtlClient from './service/WebSocketCtlClient';

export async function initClients(winId: string) {
    const device = Devices.get(winId)!;
    let { wsClient, deviceId, password } = device;
    const passwordHash = md5(password!);
    const apiUrl = WS_URL;
    try {
        new DesktopDevices(winId).setConnected(DeviceConnect.Connecting);
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
            await waitForResult(() => {
                return !wsClient || wsClient.isClosed();
            });
            new DesktopDevices(winId).setWsClient(null);
        }
        wsClient = new WebSocketClient(apiUrl, winId, deviceId!, password!, passwordHash);
        new DesktopDevices(winId).setWsClient(wsClient);
    } catch (e) {
        console.error('initClients error', e);
        new DesktopDevices(winId).setWsClient(null);
        new DesktopDevices(winId).setConnected(DeviceConnect.Closed);
    }
}

export default function DesktopPage() {
    const { onUpdateAt } = useScreenShareContext();
    useEffect(() => {
        loadDevices();
        const loading = document.querySelector('#__loading');
        //@ts-ignore
        document.body.style.appRegion = 'unset';
        //@ts-ignore
        if (loading) loading.style.display = 'none';
    }, []);
    useTimeoutLoop(async () => {
        WebSocketCtlClient.sendJsonMessage({
            eventType: 'getWindows'
        });
    }, 5000);

    useEffect(() => {
        if (!WebSocketCtlClient.getWsPyCtlClient()) {
            new AppAPI().open_ctl_server();
            WebSocketCtlClient.initClient();
        }

        function updateApp(e: any) {
            onUpdateAt();
        }

        async function init_service(e: any) {
            const { winId } = e.detail;
            await initClients(winId);
            onUpdateAt();
        }

        async function stop_service(e: any) {
            const { winId } = e.detail;
            // const password = generateRandomPassword();
            // new DesktopDevices(winId).updateDesktopDevice({ password });
            saveDevices();
            const { wsClient } = Devices.get(winId)!;
            new DesktopDevices(winId).setConnected(DeviceConnect.Inited);
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
                new DesktopDevices(winId).setWsClient(null);
                await waitForResult(() => {
                    return !wsClient || wsClient.isClosed();
                });
            }
            onUpdateAt();
        }

        window.addEventListener('updateApp', updateApp);
        window.addEventListener('init_service', init_service);
        window.addEventListener('stop_service', stop_service);
        return () => {
            window.removeEventListener('updateApp', updateApp);
            window.removeEventListener('init_service', init_service);
            window.removeEventListener('stop_service', stop_service);
        };
    }, []);

    return (
        <View absFull position={'fixed'} left={0}>
            <DesktopWindowsView />
        </View>
    );
}
