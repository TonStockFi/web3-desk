import { Snackbar } from '@mui/material';
import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import AppAPI from '../common/AppApi';
import { generateDeviceId, generateRandomPassword, waitForResult } from '../common/utils';
import { Mobile_Device_Id, WS_URL } from '../constant';
import { WsCloseCode } from '../types';
import MobileHomePage from './MobileHomePage';
import { useScreenShareContext } from './ScreenShareProvider';
import DesktopDevices, {
    DeviceConnect,
    Devices,
    loadDevices,
    saveDevices,
    updateDevices
} from './service/DesktopDevices';
import WebSocketAndroidClient from './service/WebSocketAndroidClient';

export async function initClients(winId: string) {
    localStorage.setItem('autoReconect', '1');
    const device = Devices.get(winId)!;
    // const password = generateRandomPassword();
    // updateDevices(winId, { password });
    let { wsClient, password, deviceId } = device;
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
        wsClient = new WebSocketAndroidClient(apiUrl, winId, deviceId!, password!, passwordHash);
        new DesktopDevices(winId).setWsClient(wsClient);
    } catch (e) {
        console.error('initClients error', e);
        new DesktopDevices(winId).setWsClient(null);
        new DesktopDevices(winId).setConnected(DeviceConnect.Closed);
    }
}

export function MobilePagInner() {
    const { updateAt, onUpdateAt } = useScreenShareContext();
    // console.log(JSON.stringify(device));
    const [dialogState, setDialogState] = React.useState({
        serviceMediaDialogShow: false,
        serviceInputDialogShow: false,
        serviceMediaStopDialogShow: false
    });
    const [confirming, setConfirming] = useState(false);
    const onConfirmInitService = useCallback(async () => {
        initClients(Mobile_Device_Id);
        new AppAPI().init_service();
        setDialogState({
            serviceMediaDialogShow: false,
            serviceInputDialogShow: false,
            serviceMediaStopDialogShow: false
        });
    }, []);

    const on_state_changed = async () => {
        const res = await new AppAPI().check_service();
        const deviceInfo = JSON.parse(res);
        let { mediaIsStart, mediaIsReady, inputIsOpen } = deviceInfo;
        // inputIsOpen = true;
        AppAPI.screenRecordingIsAuthed = mediaIsReady;
        AppAPI.serviceInputIsOpen = inputIsOpen;

        saveDevices();
        const device = new DesktopDevices(Mobile_Device_Id);
        const wsClient = device.getInfo().wsClient as WebSocketAndroidClient;
        if (
            wsClient &&
            wsClient.dataChannel_control &&
            device.getInfo().clientConnected &&
            wsClient.dataChannel_control?.readyState === 'open'
        ) {
            wsClient.sendDeviceInfo();
        }
        if (mediaIsStart) {
            setConfirming(false);
            setDialogState({
                serviceMediaDialogShow: false,
                serviceInputDialogShow: false,
                serviceMediaStopDialogShow: false
            });
        }
        onUpdateAt();
    };
    useEffect(() => {
        if (!AppAPI.isAdr()) {
            return;
        }
        function updateApp() {
            onUpdateAt();
        }
        new AppAPI().webview_is_ready();
        on_state_changed();
        if (localStorage.getItem('autoReconect') === '1') {
            initClients(Mobile_Device_Id);
        }
        // @ts-ignore
        window['AppCallback'] = async (
            message:
                | string
                | {
                      action: string;
                      payload: any;
                  }
        ) => {
            try {
                const { action, payload } = JSON.parse(message as string) as {
                    action: string;
                    payload: any;
                };
                if (action !== 'on_screen_image') {
                    console.log('AppCallback action', action);
                }

                switch (action) {
                    case 'on_media_projection_canceled': {
                        setConfirming(false);
                        setDialogState({
                            serviceMediaDialogShow: false,
                            serviceInputDialogShow: false,
                            serviceMediaStopDialogShow: false
                        });
                        break;
                    }
                    case 'on_screen_image': {
                        // setConfirming(false);
                        const { dataUri } = payload;
                        window.dispatchEvent(
                            new CustomEvent('on_screen_image', { detail: { dataUri } })
                        );
                        break;
                    }
                    case 'on_state_changed': {
                        on_state_changed();
                        if (
                            payload &&
                            undefined !== payload['startPushingImage'] &&
                            payload['startPushingImage']
                        ) {
                            new AppAPI().show_toast('Client Connected!');
                        }
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        window.addEventListener('updateApp', updateApp);
        return () => {
            window.removeEventListener('updateApp', updateApp);
        };
    }, []);

    const [snackbar, setSnackbar] = useState('');
    return (
        <>
            <MobileHomePage
                confirming={confirming}
                dialogState={dialogState}
                setDialogState={setDialogState}
                onConfirmInitService={onConfirmInitService}
            />
            <Snackbar
                open={!!snackbar}
                autoHideDuration={3000}
                onClose={() => {
                    setSnackbar('');
                }}
                message={snackbar}
            />
        </>
    );
}

export function MobilePage() {
    const [deviceId, setDeviceId] = useLocalStorageState('deviceId', '');
    const { updateAt, onUpdateAt } = useScreenShareContext();
    useEffect(() => {
        if (!deviceId) {
            setDeviceId(generateDeviceId());
        }
    }, [deviceId]);
    useEffect(() => {
        if (!deviceId) {
            return;
        }
        let device = Devices.get(Mobile_Device_Id);
        if (!device) {
            loadDevices();
            device = Devices.get(Mobile_Device_Id);
            if (!device) {
                let password = generateRandomPassword();
                updateDevices(Mobile_Device_Id, {
                    deviceId,
                    password,
                    winId: Mobile_Device_Id
                });
                saveDevices();
            }
        }
        onUpdateAt();
    }, [deviceId]);
    const device = Devices.get(Mobile_Device_Id);

    if (!device) {
        return (
            <View absFull center>
                <View loading></View>
            </View>
        );
    }
    return <MobilePagInner />;
}
