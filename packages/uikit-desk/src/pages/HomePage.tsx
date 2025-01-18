import Box from '@mui/material/Box';
import * as React from 'react';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Typography from '@mui/material/Typography';
import { View } from '@web3-explorer/uikit-view';
import AppAPI from '../common/AppApi';
import ServerApi from '../common/ServerApi';
import { formatNumber, isDesktop, isMac } from '../common/utils';
import BottomNavigationView from '../components/BottomNavigationView';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SwerverManager from '../components/SwerverManager';
import DeviceCard from '../view/Device/DeviceCard';
import PermissionsCard from '../view/Device/PermissionsCard';
import ServerCard from '../view/Device/ServerCard';
import ServiceStartCard from '../view/Device/ServiceStartCard';

export default function HomePage({
    skipDesktop,
    confirming,
    appAPI,
    onChangeApi,
    setState,
    state,
    connected,
    deviceId,
    password,
    screenRecordingIsAuthed,
    // onRefreshPassword,
    serviceInputIsOpen,
    serviceMediaIsRunning,
    onConfirmInitService
}: {
    skipDesktop?: boolean;
    screenRecordingIsAuthed: boolean;
    confirming: boolean;
    onChangeApi: any;
    connected: number;
    setState: any;
    state: any;
    onConfirmInitService: any;
    deviceId: string;
    // onRefreshPassword: any;
    password: string;
    appAPI: AppAPI;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    const [tabId, setTabId] = React.useState('link');

    const handleInputService = React.useCallback(
        (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            if (!serviceInputIsOpen) {
                setState({
                    ...state,
                    serviceInputDialogShow: true
                });
            } else {
                appAPI.stop_input();
            }
            return false;
        },
        [serviceInputIsOpen]
    );

    const handleMediaService = React.useCallback(
        (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            if (ServerApi.getServerApi().length === 0) {
                alert('服务地址不能为空');
                return;
            }

            if (!ServerApi.getServerApi().startsWith('ws')) {
                alert('服务地址必须以ws://或者wss://开头');
                return;
            }
            if (isDesktop()) {
                // if (!AppAPI.pythonPath) {
                //     alert('Python路径没有配置,请按帮助文档设置Python路径');
                //     return;
                // }
                if (!screenRecordingIsAuthed) {
                    alert('启动服务前,请开启屏幕录制');
                    return;
                }
            }
            if (!serviceMediaIsRunning) {
                setState({
                    ...state,
                    serviceMediaDialogShow: true
                });
            } else {
                setState({
                    ...state,
                    serviceMediaStopDialogShow: true
                });
            }
            return false;
        },
        [serviceMediaIsRunning, screenRecordingIsAuthed]
    );
    // @ts-ignore
    return (
        <View w100p aCenter jCenter>
            <Box
                sx={{
                    width: '100vw',
                    maxWidth: 720,
                    paddingBottom: '64px',
                    flexDirection: 'column',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {tabId === 'link' && (
                    <>
                        <Box
                            sx={{
                                display: isDesktop() ? 'none' : 'flex',
                                pt: 4,
                                height: 85,
                                fontSize: 32,
                                color: '#333',
                                fontWeight: 700,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            Web3 Desk
                        </Box>
                        <Box
                            sx={{
                                pt: isDesktop() ? 3 : undefined,
                                m: 1
                            }}
                        >
                            <Box sx={{ mb: 2, minWidth: 320 }}>
                                {serviceMediaIsRunning ? (
                                    <DeviceCard
                                        handleMediaService={handleMediaService}
                                        connected={connected}
                                        // onRefreshPassword={onRefreshPassword}
                                        password={password}
                                        deviceId={deviceId ? formatNumber(Number(deviceId)) : ''}
                                    />
                                ) : (
                                    <ServiceStartCard handleMediaService={handleMediaService} />
                                )}
                            </Box>
                            <Box>
                                <PermissionsCard
                                    screenRecordingIsAuthed={screenRecordingIsAuthed}
                                    handleInputService={handleInputService}
                                    handleMediaService={handleMediaService}
                                    serviceInputIsOpen={serviceInputIsOpen}
                                    serviceMediaIsRunning={serviceMediaIsRunning}
                                />
                            </Box>

                            <View mt12 hide>
                                <ServerCard />
                            </View>
                            <View rowVCenter center mt12>
                                <View
                                    hide={!isMac()}
                                    mr12
                                    mt12
                                    buttonOutlined={'隐私与安全'}
                                    onClick={() => {
                                        new AppAPI().open_screen_recording_settings();
                                    }}
                                ></View>
                                <View
                                    mt12
                                    buttonOutlined={'使用文档'}
                                    onClick={() => {
                                        new AppAPI().open_url(
                                            'https://web3coin.gitbook.io/doc/chan-pin/web3desk'
                                        );
                                    }}
                                ></View>
                            </View>
                            {/* <View mt12 hide={!isDesktop()}>
                                <PythonPathView />
                            </View> */}

                            <ConfirmationDialog
                                {...{
                                    id: 'stop_service',
                                    title: '警告',
                                    titleIcon: <WarningAmberIcon sx={{ color: 'red' }} />,
                                    content: '关闭服务将自动关闭所有已建立的连接',
                                    keepMounted: true,
                                    open: state.serviceMediaStopDialogShow,
                                    onConfirm: () => {
                                        setState({
                                            ...state,
                                            serviceMediaStopDialogShow: false
                                        });
                                        appAPI.stop_service();
                                    },
                                    onCancel: () => {
                                        setState({
                                            ...state,
                                            serviceMediaStopDialogShow: false
                                        });
                                    }
                                }}
                            />
                            <ConfirmationDialog
                                {...{
                                    confirming,
                                    id: 'start_service',
                                    title: '警告',
                                    titleIcon: <WarningAmberIcon sx={{ color: 'red' }} />,
                                    content:
                                        '开启录屏权限将自动开启服务，允许其他设备向此设备清求建立连接',
                                    keepMounted: true,
                                    open: state.serviceMediaDialogShow,
                                    onConfirm: async () => {
                                        onConfirmInitService();
                                    },
                                    onCancel: () => {
                                        setState({
                                            ...state,
                                            serviceMediaDialogShow: false
                                        });
                                    }
                                }}
                            />
                            <ConfirmationDialog
                                {...{
                                    id: 'input_service',
                                    title: '如何获取安桌的输入权限',
                                    confirmTxt: '打开系统设置',
                                    content: (
                                        <>
                                            <Typography sx={{ mb: 1 }}>
                                                为了让远程设备通过鼠标或触屏控制您的安卓设备，你需要允许使用"无障碍"服务。
                                            </Typography>
                                            <Typography>
                                                请在接下来的系统设置页面里，找到并进入【已安装的服务】页面，交服务开启
                                            </Typography>
                                        </>
                                    ),
                                    keepMounted: true,
                                    open: state.serviceInputDialogShow,
                                    onConfirm: () => {
                                        appAPI.start_action(
                                            'android.settings.ACCESSIBILITY_SETTINGS'
                                        );
                                        setState({
                                            ...state,
                                            serviceInputDialogShow: false
                                        });
                                    },
                                    onCancel: () => {
                                        setState({
                                            ...state,
                                            serviceInputDialogShow: false
                                        });
                                    }
                                }}
                            />
                        </Box>
                    </>
                )}

                {tabId === 'server' && (
                    <Box sx={{ maxWidth: 720, pt: 2 }}>
                        <SwerverManager />
                    </Box>
                )}
                {0 && (
                    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
                        <BottomNavigationView tabId={tabId} setTabId={setTabId} />
                    </Box>
                )}
            </Box>
        </View>
    );
}
