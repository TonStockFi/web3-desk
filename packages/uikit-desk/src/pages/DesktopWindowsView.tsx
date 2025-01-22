import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { default as AppAPI } from '../common/AppApi';

import { ViewWithSize } from '@web3-explorer/uikit-view';
import {
    generateDeviceId,
    generateRandomPassword,
    getVedeoSize,
    getVideoId,
    isMac,
    sleep,
    waitForResult
} from '../common/utils';
import DesktopShareView, { QrCodeView } from './DesktopShareView';

import { useTimeoutLoop } from '@web3-explorer/utils';
import { useScreenShareContext } from './ScreenShareProvider';
import DesktopDevices, {
    DeviceConnect,
    Devices,
    loadDevices,
    saveDevices,
    updateDevices
} from './service/DesktopDevices';
import WebSocketClient from './service/WebSocketClient';
import WebSocketCtlClient from './service/WebSocketCtlClient';

export function DesktopWindowsView() {
    const { updateAt } = useScreenShareContext();
    const [viewSize, setViewSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0
    });

    const [sources, setSources] = useState<{ name: string; id: string; display_id: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSourceId, setCurrentSourceId] = useState('');

    const getScreen = async (id: string) => {
        const video_id = 'video_preview';
        setLoading(true);
        let videoElement = document.getElementById(video_id) as HTMLVideoElement;
        WebSocketCtlClient.sendJsonMessage({
            eventType: 'getWindows'
        });
        await sleep(200);
        const rows = await new AppAPI().get_sources(['window', 'screen']);

        await waitForResult(() => {
            videoElement = document.getElementById(video_id) as HTMLVideoElement;
            return videoElement;
        });

        const screenSource1 = rows.find((row: any) => row.id === id);
        if (!screenSource1) {
            setLoading(false);
            videoElement!.srcObject = null;
            return;
        }
        const name = screenSource1.name;
        loadDevices();
        let device = Devices.get(screenSource1.id);
        let password, deviceId;
        if (!device) {
            password = generateRandomPassword();
            deviceId = generateDeviceId();

            updateDevices(screenSource1.id, {
                deviceId,
                password,
                winId: screenSource1.id
            });
            saveDevices();
            device = Devices.get(screenSource1.id);
        }

        if (!isMac() && !screenSource1.display_id) {
            const win = WebSocketCtlClient.getWindows().find(win => win.title === name);
            setSources(filterWindows(rows));
            if (!win) {
                setLoading(false);
                return;
            }
            if (win.bounds.x < 0 || win.bounds.y < 0) {
                setLoading(false);
                return;
            }
        } else {
            setSources(filterWindows(rows));
        }
        const { width, height } = window.screen;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                cursor: 'never',
                ...({
                    mandatory: {
                        minWidth: width,
                        minHeight: height,
                        minFrameRate: 30,
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: screenSource1.id
                    }
                } as any)
            }
        });

        videoElement!.srcObject! = stream;
        await new Promise(resolve => (videoElement!.onloadedmetadata = resolve));
        videoElement!.play();
        setLoading(false);
    };

    function filterWindows(sources: any) {
        return sources.filter((row: any) => {
            if (row.display_id) return true;
            const win = WebSocketCtlClient.getWindows().find(win => win.title === row.name);
            return win && win.bounds.x >= 0 && win.bounds.y >= 0;
        });
    }
    const [showDrawer, setShowDawer] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await waitForResult(() => {
                return WebSocketCtlClient.getWsPyCtlClient();
            }, 500);
            await waitForResult(() => {
                return WebSocketCtlClient.getWindows().length > 0;
            }, 100);
            WebSocketCtlClient.sendJsonMessage({
                eventType: 'getWindows'
            });
            await sleep(100);
            const sources = await new AppAPI().get_sources(['window', 'screen']);
            console.log(sources);
            const rows = filterWindows(sources);
            setSources(rows);
            setLoading(false);
        })();
    }, []);

    const selectedSource = sources.find(
        (row: { id: string; name: string }) => row.id === currentSourceId
    );

    let title = '';
    let width = 0,
        height = 0,
        x = 0,
        y = 0;
    let win;
    if (selectedSource) {
        //@ts-ignore
        title = selectedSource.name;

        if (!selectedSource.display_id) {
            win = WebSocketCtlClient.getWindows().find(row => row.title === selectedSource.name);
            if (win && win.bounds) {
                width = win.bounds.width;
                height = win.bounds.height;
                x = win.bounds.x;
                y = win.bounds.y;
            }
        } else {
            width = window.screen.width;
            height = window.screen.height;
        }
    }
    const device = Devices.get(currentSourceId);
    if (currentSourceId) {
        const wsClient = device?.wsClient as WebSocketClient;
        if (wsClient) {
            wsClient.setSources(sources);
        }
    }

    const RowItem = ({ source }: { source: any }) => {
        const device = new DesktopDevices(source.id);
        const { connected, serviceMediaIsRunning } = device.getState();
        const isConnected = connected === DeviceConnect.Connected;
        const isPushing = serviceMediaIsRunning;

        let borderLeft;
        let bgcolor;
        if (isConnected) {
            if (!isPushing) {
                borderLeft = `4px solid green`;
            } else {
                bgcolor = 'green';
            }
        }
        const title = source.name.substring(0, 18);
        const [thumb, setThumb] = useState('');
        async function getAppInfo(id: string) {
            //@ts-ignore
            const res = await window.backgroundApi.get_app_info(id);
            if (res) {
                setThumb(res.thumbnail);
            }
        }
        useEffect(() => {
            getAppInfo(source.id);
        }, []);
        useTimeoutLoop(async () => {
            await getAppInfo(source.id);
        }, 2000);
        return (
            <View
                w={200}
                mb12
                mr12
                sx={{
                    '& .MuiButtonBase-root ': {
                        border: '1px solid rgb(255 255 255 / 8%)',
                        // borderRadius: 1,
                        borderLeft,
                        bgcolor,
                        flexDirection: 'column',
                        borderRadius: 2,
                        mb: 0.5
                    },
                    '& .MuiListItemButton-root.Mui-selected': {
                        bgcolor
                    },
                    '& .MuiTypography-root': {
                        fontSize: '0.8rem'
                    }
                }}
                onClick={async () => {
                    setCurrentSourceId(source.id);
                    setShowDawer(true);
                    getScreen(source.id);
                }}
                listSelected={source.id === currentSourceId}
                listItemText={title}
                listItemRight={
                    <View center w={130} h={80}>
                        <video
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                display: 'none'
                            }}
                            src=""
                            id={getVideoId(source)}
                        ></video>
                        {thumb && (
                            <img
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                                src={thumb}
                            ></img>
                        )}
                        {!thumb && <View loading></View>}
                    </View>
                }
                borderBox
            ></View>
        );
    };
    const rightSide = 320;
    if (loading && !currentSourceId) {
        return (
            <View absFull center>
                <View loading></View>
            </View>
        );
    }
    return (
        <>
            <View
                drawer={{
                    open: showDrawer,
                    onClose: () => {
                        setShowDawer(false);
                    }
                }}
            >
                <View w100vw h100vh relative>
                    <View abs xx0 top0 h={44} rowVCenter jSpaceBetween>
                        <View rowVCenter pl12>
                            <View
                                onClick={() => {
                                    setShowDawer(false);
                                }}
                                iconButtonSmall
                                icon={'Back'}
                            ></View>
                            <View ml12 text={selectedSource?.name}></View>
                        </View>
                        <View rowVCenter pr12>
                            {device && (
                                <View hide drawer={{}} buttonOutlined={'二维码'}>
                                    <View w={320} h100p relative>
                                        <QrCodeView
                                            text={`${device!.deviceId}:${device!.password}`}
                                        ></QrCodeView>
                                    </View>
                                </View>
                            )}

                            {/* <View
                            mr12
                            hide={!(selectedSource && selectedSource.display_id === '')}
                            buttonOutlined={'打开程序'}
                            onClick={() => {
                                WebSocketCtlClient.sendJsonMessage({
                                    eventType: 'ctlWin',
                                    action: 'active',
                                    winName: selectedSource!.name
                                });
                            }}
                        ></View> */}
                            {/* <View
                            buttonOutlined={'使用文档'}
                            onClick={() => {
                                new AppAPI().open_url(
                                    'https://web3coin.gitbook.io/doc/chan-pin/web3desk'
                                );
                            }}
                        ></View> */}
                        </View>
                    </View>
                    <View absFull top={44}>
                        <ViewWithSize
                            onChangeSize={v => {
                                setViewSize(v);
                            }}
                            right={rightSide}
                            absFull
                            top={0}
                            center
                            bgColor="#e6e6e6"
                            p={56}
                        >
                            <View borderBox relative center overflowHidden wh100p rowVCenter>
                                <video
                                    style={{
                                        ...getVedeoSize(viewSize, { width, height }, 44),
                                        display: loading ? 'none' : 'block'
                                    }}
                                    src=""
                                    id={'video_preview'}
                                ></video>
                            </View>
                            <View hide={!loading} center wh100p absFull>
                                <View loading></View>
                            </View>
                            <View abs bottom={6} right={12} left={12} rowVCenter jSpaceBetween>
                                <View rowVCenter>
                                    {Boolean(
                                        device?.serviceMediaIsRunning ||
                                            device?.connected === DeviceConnect.Connecting
                                    ) && (
                                        <View mr12 pt={4} rowVCenter>
                                            <View loadingProps={{ size: 14 }} loading></View>
                                        </View>
                                    )}

                                    {Boolean(
                                        device?.connected === DeviceConnect.Connected &&
                                            !device?.serviceMediaIsRunning
                                    ) && <View textSmall textColor="green" text={'已连接'}></View>}

                                    {Boolean(
                                        device?.connected === DeviceConnect.Connected &&
                                            device?.serviceMediaIsRunning
                                    ) && (
                                        <View textSmall textColor="green" text={'正在推送'}></View>
                                    )}

                                    {device?.connected === DeviceConnect.Connecting && (
                                        <View textSmall textColor="green" text={'正在连接'}></View>
                                    )}
                                    {Boolean(
                                        undefined === device?.connected ||
                                            device?.connected === DeviceConnect.Inited
                                    ) && <View textSmall textColor="blue" text={'等待连接'}></View>}

                                    {device?.connected === DeviceConnect.Closed && (
                                        <View textSmall textColor="blue" text={'连接关闭'}></View>
                                    )}
                                </View>

                                <View rowVCenter useSelectText hide={!device}>
                                    <View
                                        textSmall
                                        textColor="#666"
                                        text={`x: ${x} y: ${y} / w: ${width} h: ${height}`}
                                    ></View>
                                </View>
                            </View>
                        </ViewWithSize>

                        <View w={rightSide} h100p abs top0 bottom0 right0>
                            {device && (
                                <DesktopShareView
                                    winId={device.winId}
                                    deviceId={device.deviceId!}
                                    password={device.password!}
                                ></DesktopShareView>
                            )}
                        </View>
                    </View>
                </View>
            </View>
            <View absFull right0 hide left={240} top0 bottom={0} p={12} center>
                <View
                    abs
                    top={0}
                    rowVCenter
                    jSpaceBetween
                    xx0
                    h={44}
                    center
                    sx={{
                        borderBottom: '1px solid #e9e9e9'
                    }}
                >
                    <View rowVCenter pl12 jSpaceBetween>
                        <View rowVCenter>
                            <View drawer={{}} buttonContained={'共享屏幕'}></View>
                        </View>
                    </View>
                    <View rowVCenter mr12 jEnd></View>
                </View>
            </View>

            <View
                abs
                left0
                right0
                top={0}
                bottom={0}
                px={24}
                borderBox
                bgColor="#3b3b3b"
                overflowYAuto
                sx={{
                    borderRight: '1px solid #e9e9e9'
                }}
                flx
                column
            >
                <View>
                    <View
                        rowVCenter
                        jStart
                        w100p
                        h={44}
                        pb12
                        mb12
                        borderBottomColor="rgb(255 255 255 / 8%)"
                    >
                        <View mt12 ml12 textColor="#EBEBEB" text={'桌面屏幕'}></View>
                    </View>

                    <View column mb={6} w100p>
                        <View
                            list
                            ml={8}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                '& .MuiListItemButton-root.Mui-selected': {
                                    bgcolor: '#222224'
                                },
                                '& .MuiListItemButton-root:hover': {
                                    bgcolor: '#2F2F33'
                                }
                            }}
                        >
                            {sources
                                .filter(row => row.display_id)
                                .map((source: any) => {
                                    return (
                                        <RowItem
                                            key={source.id + updateAt}
                                            source={source}
                                        ></RowItem>
                                    );
                                })}
                        </View>
                    </View>
                    <View
                        pt12
                        rowVCenter
                        jStart
                        w100p
                        h={32}
                        mb12
                        borderBottomColor="rgb(255 255 255 / 8%)"
                        hide={sources.filter(row => !row.display_id).length === 0}
                    >
                        <View pb12 mb12 ml12 textColor="#EBEBEB" text={'程序屏幕'}></View>
                    </View>
                </View>
                <View flex1 relative hide={sources.filter(row => !row.display_id).length === 0}>
                    <View absFull overflowYAuto>
                        <View w100p>
                            <View
                                ml={6}
                                list
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    '& .MuiListItemButton-root.Mui-selected': {
                                        bgcolor: '#222224'
                                    },
                                    '& .MuiListItemButton-root:hover': {
                                        bgcolor: '#2F2F33'
                                    }
                                }}
                            >
                                {sources
                                    .filter(row => !row.display_id)
                                    .map((source: any) => {
                                        return (
                                            <RowItem
                                                key={source.id + updateAt}
                                                source={source}
                                            ></RowItem>
                                        );
                                    })}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}
