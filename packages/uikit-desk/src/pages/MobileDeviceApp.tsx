import { Snackbar } from '@mui/material';
import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { useLocalStorageState, useTimeoutLoop } from '@web3-explorer/utils';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import AppAPI from '../common/AppApi';
import ServerApi from '../common/ServerApi';
import { generateDeviceId, generateRandomPassword, isDesktop } from '../common/utils';
import DesktopPage from './DesktopPage';
import HomePage from './HomePage';

export const KEY_DEVICE_ID = 'device_device_id_1';
const KEY_PASSWORD = 'device_password';

export default function App() {
    if (isDesktop()) {
        return <DesktopPage />;
    } else {
        return <AppInner />;
    }
}
export function AppInner() {
    const appAPI = new AppAPI();
    const [state, setState] = React.useState({
        serviceMediaDialogShow: false,
        serviceInputDialogShow: false,
        serviceMediaStopDialogShow: false
    });

    const [deviceId, setDeviceId] = useLocalStorageState(KEY_DEVICE_ID, '');
    const [password, setPassword] = useLocalStorageState(KEY_PASSWORD, '');
    const [connected, setConnected] = useState(0);
    const [screenRecordingIsAuthed, setScreenRecordingIsAuthed] = useState(false);
    const [serviceInputIsOpen, setServiceInputIsOpen] = useState(false);
    const [serviceMediaIsRunning, setServiceMediaIsRunning] = useState(false);
    const [confirming, setConfirming] = useState(false);

    React.useEffect(() => {
        const loading = document.querySelector('#__loading');
        //@ts-ignore
        document.body.style.appRegion = 'unset';
        //@ts-ignore
        if (loading) loading.style.display = 'none';
    }, []);
    const onConfirmInitService = useCallback(async () => {
        setConfirming(true);
        const password = generateRandomPassword();
        setPassword(password);
        const passwordHash = md5(password);
        appAPI.init_service(ServerApi.getServerApi(), password, passwordHash);
    }, []);

    const onChangeApi = () => {
        appAPI.stop_service();
    };

    useEffect(() => {
        if (!deviceId) {
            const deviceId = generateDeviceId();
            setDeviceId(deviceId);
        }
    }, [deviceId]);
    const handleState = async () => {
        const res = await new AppAPI().check_state();
        const {
            accessibilityStatus,
            screenRecordingIsAuthed,
            serviceInputIsOpen,
            screenRecordingStatus
        } = res || {};
        AppAPI.serviceInputIsOpen = !!serviceInputIsOpen;

        AppAPI.screenRecordingStatus = screenRecordingStatus;
        AppAPI.accessibilityStatus = accessibilityStatus;
        AppAPI.screenRecordingIsAuthed = screenRecordingIsAuthed;
    };

    const on_state_changed = async () => {
        await handleState();
        const res = await appAPI.check_service();
        const deviceInfo = JSON.parse(res);
        // console.log({ deviceInfo });
        const { mediaIsStart, screenRecordingIsAuthed, isWsConnected, isWsReady, inputIsOpen } =
            deviceInfo;
        setScreenRecordingIsAuthed(!!screenRecordingIsAuthed);
        setServiceInputIsOpen(inputIsOpen);
        setServiceMediaIsRunning(mediaIsStart);
        const password = localStorage.getItem(KEY_PASSWORD);
        const deviceId = localStorage.getItem(KEY_DEVICE_ID);
        console.log('on_state_changed', res, deviceId);

        if (isWsReady) {
            setConnected(1);
        } else {
            if (!isWsConnected) {
                setConnected(0);
            }
        }

        let passwordHash;
        if (mediaIsStart) {
            setConfirming(false);
            setState({
                serviceMediaDialogShow: false,
                serviceInputDialogShow: false,
                serviceMediaStopDialogShow: false
            });

            if (password && deviceId) {
                passwordHash = md5(password);
            }
        }
    };
    useEffect(() => {
        if (!deviceId) {
            return;
        }

        appAPI.webview_is_ready(ServerApi.getServerApi(), deviceId);
        console.log('on_state_changed ...');
        on_state_changed().catch(console.error);

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
                const { action, payload } = isDesktop()
                    ? (message as {
                          action: string;
                          payload: any;
                      })
                    : (JSON.parse(message as string) as {
                          action: string;
                          payload: any;
                      });
                console.log('AppCallback action', action);
                switch (action) {
                    // case 'on_media_projection_canceled':
                    //     //setApi(api);
                    //     ServerApi.setServerApi(payload);
                    //     onChangeApi();
                    //     break;

                    case 'stop_retry_ws': {
                        setConfirming(false);
                        setConnected(-1);
                        setServiceMediaIsRunning(false);
                        alert('连接服务端失败，请检查服务端是否启动或者服务端地下是否正确');
                        break;
                    }
                    case 'on_media_projection_canceled': {
                        setConfirming(false);
                        setState({
                            serviceMediaDialogShow: false,
                            serviceInputDialogShow: false,
                            serviceMediaStopDialogShow: false
                        });
                        break;
                    }
                    case 'on_state_changed': {
                        on_state_changed();
                        if (
                            payload &&
                            undefined !== payload['startPushingImage'] &&
                            payload['startPushingImage']
                        ) {
                            appAPI.show_toast('Client Connected!');
                        }
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
    }, [deviceId]);

    const [snackbar, setSnackbar] = useState('');

    useTimeoutLoop(async () => {
        if (isDesktop()) {
            handleState();
            const res = await new AppAPI().check_service();
            const { isWsConnected } = JSON.parse(res);
            console.log('check_service', res);
            if (isWsConnected) {
                setConnected(1);
            }
            if (!state.serviceMediaStopDialogShow) {
                on_state_changed();
            }
        }
    }, 2000);
    return (
        <>
            {/* <View
                hide={!isDesktop()}
                appRegionDrag
                zIdx={1000}
                position="fixed"
                top0
                xx0
                h={44}
            ></View> */}
            <HomePage
                screenRecordingIsAuthed={screenRecordingIsAuthed}
                confirming={confirming}
                onChangeApi={onChangeApi}
                connected={connected}
                state={state}
                setState={setState}
                deviceId={deviceId}
                onConfirmInitService={onConfirmInitService}
                password={password}
                appAPI={appAPI}
                serviceMediaIsRunning={serviceMediaIsRunning}
                serviceInputIsOpen={serviceInputIsOpen}
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
