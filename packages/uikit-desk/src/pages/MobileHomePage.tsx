import Box from '@mui/material/Box';
import * as React from 'react';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Typography from '@mui/material/Typography';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';
import AppAPI from '../common/AppApi';
import { isDesktop, isLocalDev, waitForResult } from '../common/utils';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DecisionView from '../components/DecisionView';
import { Mobile_Device_Id } from '../constant';
import { WsCloseCode } from '../types';
import DeviceCard from '../view/Device/DeviceCard';
import PermissionsCard from '../view/Device/PermissionsCard';
import ServerCard from '../view/Device/ServerCard';
import StatusCard from '../view/Device/StatusCard';
import { useScreenShareContext } from './ScreenShareProvider';
import DesktopDevices, { DeviceConnect, Devices } from './service/DesktopDevices';

export default function MobileHomePage({
    confirming,
    setDialogState,
    dialogState,
    onConfirmInitService
}: {
    confirming: boolean;
    setDialogState: any;
    dialogState: any;
    onConfirmInitService: any;
}) {
    const [tabId, setTabId] = useLocalStorageState('tabId', 'link');
    const { updateAt, onUpdateAt } = useScreenShareContext();

    const device = new DesktopDevices(Mobile_Device_Id);
    const { password, deviceId } = device.getInfo();
    const { screenRecordingIsAuthed, serviceInputIsOpen, serviceMediaIsRunning, connected } =
        device.getState();

    const handleInputService = React.useCallback((event: any) => {
        event.stopPropagation();
        event.preventDefault();
        if (!AppAPI.serviceInputIsOpen) {
            setDialogState({
                ...dialogState,
                serviceInputDialogShow: true
            });
        } else {
            AppAPI.serviceInputIsOpen = false;
            new AppAPI().stop_input();
        }
        return false;
    }, []);

    const handleMediaService = React.useCallback(
        (event: any) => {
            event.stopPropagation();
            event.preventDefault();

            const { serviceMediaIsRunning } = device.getState();

            if (!serviceMediaIsRunning) {
                new DesktopDevices(Mobile_Device_Id).setConnected(DeviceConnect.Inited);

                setDialogState({
                    ...dialogState,
                    serviceMediaDialogShow: true
                });
            } else {
                // setDialogState({
                //     ...dialogState,
                //     serviceMediaStopDialogShow: true
                // });
            }
            return false;
        },
        [dialogState]
    );

    async function onStopService() {
        // new AppAPI().stop_service();
        localStorage.removeItem('autoReconect');
        const { wsClient } = Devices.get(Mobile_Device_Id)!;
        new DesktopDevices(Mobile_Device_Id).setConnected(DeviceConnect.Inited);
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
            new DesktopDevices(Mobile_Device_Id).setWsClient(null);
            await waitForResult(() => {
                return !wsClient || wsClient.isClosed();
            });
        }
        onUpdateAt();
        setDialogState({
            ...dialogState,
            serviceMediaStopDialogShow: false
        });
    }

    return (
        <View absFull>
            <View
                onClick={() => {
                    if (isLocalDev()) {
                        location.reload();
                    }
                }}
                sx={{
                    display: isDesktop() ? 'none' : 'flex',
                    pt: 2,
                    height: 85,
                    fontSize: 32,
                    color: '#333',
                    fontWeight: 700,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                Web3 Desk
            </View>
            <View absFull top={85} overflowYAuto>
                <View
                    column
                    sx={{
                        maxWidth: 720,
                        margin: '0 auto'
                    }}
                    pl={6}
                >
                    <Box sx={{ m: 1 }}>
                        <Box sx={{ mb: 2, minWidth: 320 }}>
                            <DeviceCard
                                onStopService={onStopService}
                                winId={Mobile_Device_Id}
                                handleMediaService={handleMediaService}
                                connected={connected}
                                password={password!}
                                deviceId={deviceId ? deviceId : ''}
                            />
                        </Box>

                        <Box>
                            <PermissionsCard
                                onStopService={onStopService}
                                connected={connected}
                                screenRecordingIsAuthed={screenRecordingIsAuthed}
                                serviceMediaIsRunning={serviceMediaIsRunning}
                                serviceInputIsOpen={serviceInputIsOpen}
                                handleInputService={handleInputService}
                                handleMediaService={handleMediaService}
                            />
                        </Box>

                        <View py12>
                            <StatusCard winId={Mobile_Device_Id}></StatusCard>
                        </View>
                        <View mt12 hide>
                            <ServerCard />
                        </View>
                        <View rowVCenter center mt12>
                            <View
                                hide
                                mt12
                                buttonOutlined={'使用文档'}
                                onClick={() => {
                                    new AppAPI().open_url(
                                        'https://web3coin.gitbook.io/doc/chan-pin/web3desk'
                                    );
                                }}
                            ></View>
                        </View>

                        <ConfirmationDialog
                            {...{
                                id: 'stop_service',
                                title: '警告',
                                titleIcon: <WarningAmberIcon sx={{ color: 'red' }} />,
                                content: '关闭服务将自动关闭所有已建立的连接',
                                keepMounted: true,
                                open: dialogState.serviceMediaStopDialogShow,
                                onConfirm: async () => {
                                    onStopService();
                                },
                                onCancel: () => {
                                    setDialogState({
                                        ...dialogState,
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
                                content: (
                                    <View>
                                        <View
                                            mb={3}
                                            textSmall
                                            text={
                                                '开启录屏权限将自动开启服务，允许其他设备向此设备清求建立连接'
                                            }
                                        ></View>
                                        <View textSmall text={'远程控制需要启用 “输入控制”'}></View>
                                    </View>
                                ),
                                keepMounted: true,
                                open: dialogState.serviceMediaDialogShow,
                                onConfirm: async () => {
                                    onConfirmInitService();
                                },
                                onCancel: () => {
                                    setDialogState({
                                        ...dialogState,
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
                                open: dialogState.serviceInputDialogShow,
                                onConfirm: () => {
                                    new AppAPI().start_action(
                                        'android.settings.ACCESSIBILITY_SETTINGS'
                                    );
                                    setDialogState({
                                        ...dialogState,
                                        serviceInputDialogShow: false
                                    });
                                },
                                onCancel: () => {
                                    setDialogState({
                                        ...dialogState,
                                        serviceInputDialogShow: false
                                    });
                                }
                            }}
                        />
                    </Box>
                    <View displayNone={true}>
                        <DecisionView />
                    </View>
                </View>
            </View>
        </View>
    );
}
