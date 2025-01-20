import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { default as AppAPI } from '../common/AppApi';

import { ViewWithSize } from '@web3-explorer/uikit-view';
import {
    captureFrame,
    destroyStream,
    generateDeviceId,
    generateRandomPassword,
    getVedeoSize,
    getVideoId,
    isMac,
    sleep
} from '../common/utils';
import DesktopShareView from './DesktopShareView';

import { useScreenShareContext } from './ScreenShareProvider';
import DesktopDevices, {
    DeviceConnect,
    Devices,
    saveDevices,
    updateDevices
} from './service/DesktopDevices';
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

    const getScreen = async (id: string, name: string, video_id: string, isThumbnail?: boolean) => {
        if (video_id === 'video_preview') {
            setLoading(true);
        }

        const rows = await new AppAPI().get_sources(['window', 'screen']);

        WebSocketCtlClient.sendJsonMessage({
            eventType: 'getWindows'
        });
        const videoElement = document.getElementById(video_id) as HTMLVideoElement;
        if (!videoElement) {
            setLoading(false);
            return;
        }
        const screenSource1 = rows.find((row: any) => row.id === id);
        if (!screenSource1) {
            setLoading(false);
            videoElement!.srcObject = null;
            return;
        }
        const device = Devices.get(screenSource1.id);
        let password, deviceId;
        if (!device) {
            password = generateRandomPassword();
            deviceId = generateDeviceId();
        } else {
            password = device.password;
            deviceId = device.deviceId;
        }
        updateDevices(screenSource1.id, {
            deviceId,
            password,
            winId: screenSource1.id
        });
        saveDevices();

        await sleep(1000);
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
                ...({
                    mandatory: {
                        minWidth: width,
                        minHeight: height,
                        minFrameRate: 30,
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: screenSource1.id,
                        cursor: 'never' // 👈 This disables the cursor
                    }
                } as any)
            }
        });

        videoElement!.srcObject! = stream;
        await new Promise(resolve => (videoElement!.onloadedmetadata = resolve));
        videoElement!.play();
        if (video_id === 'video_preview') {
            setLoading(false);
        }

        await new Promise(resolve => {
            if (isThumbnail) {
                videoElement!.onplay = () => {
                    const image = captureFrame(videoElement!);
                    const thumbnailElement = document.getElementById(
                        video_id.replace('win', 'pic')
                    ) as HTMLImageElement;
                    if (thumbnailElement && image) {
                        thumbnailElement.src = image;
                    }
                    destroyStream(stream);
                    videoElement!.srcObject = null;
                };
            }
            resolve(true);
        });
    };
    function filterWindows(sources: any) {
        return sources.filter((row: any) => {
            if (row.display_id) return true;
            const win = WebSocketCtlClient.getWindows().find(win => win.title === row.name);
            return win && win.bounds.x >= 0 && win.bounds.y >= 0;
        });
    }

    useEffect(() => {
        if (viewSize.height === 0) {
            return;
        }
        (async () => {
            if (!isMac()) {
                WebSocketCtlClient.sendJsonMessage({
                    eventType: 'getWindows'
                });
                await sleep(1000);
            }
            const sources = await new AppAPI().get_sources(['window', 'screen']);
            const rows = filterWindows(sources);
            setSources(rows);
            let id = currentSourceId;
            if (!currentSourceId) {
                id = rows[0].id;
                setCurrentSourceId(id);
            }
            const selectedSource = rows.find((row: { id: string; name: string }) => row.id === id);
            if (selectedSource) {
                getScreen(id, selectedSource.name, 'video_preview');
            }
        })();
    }, [viewSize]);

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
    const RowItem = ({ source }: { source: any }) => {
        const device = new DesktopDevices(source.id);
        const { connected, serviceMediaIsRunning } = device.getState();
        const isConnected = connected === DeviceConnect.Connected;
        const isPushing = serviceMediaIsRunning;
        let borderLeft;
        let bgColor;
        if (isConnected) {
            if (!isPushing) {
                borderLeft = `4px solid green`;
            } else {
                bgColor = 'green';
            }
        }
        return (
            <View
                w={220}
                sx={{
                    '& .MuiButtonBase-root ': {
                        borderLeft,
                        bgColor,
                        borderRadius: 2,
                        mb: 0.5
                    },
                    '& .MuiTypography-root': {
                        fontSize: '0.8rem'
                    }
                }}
                onClick={async () => {
                    setCurrentSourceId(source.id);
                    await getScreen(source.id, source.name, 'video_preview');
                }}
                listSelected={source.id === currentSourceId}
                listItemText={source.name.substring(0, 18)}
                borderBox
            ></View>
        );
    };

    return (
        <>
            <View absFull right0 left={240} top0 bottom={0} p={12} center>
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
                            <View drawer={{}} buttonContained={'共享屏幕'}>
                                <View w={360} h100p>
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
                    <View rowVCenter mr12 jEnd>
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
                <ViewWithSize
                    onChangeSize={v => {
                        setViewSize(v);
                    }}
                    absFull
                    top={44}
                    center
                    bgColor="#e6e6e6"
                    p={56}
                >
                    <View abs xx0 top0 h={56} overflowHidden rowVCenter center px={24}>
                        <View textColor="#333" hide={!selectedSource} text={title || ''}></View>
                    </View>
                    <View borderBox relative center overflowHidden wh100p rowVCenter>
                        <video
                            style={{
                                ...getVedeoSize(viewSize, { width, height }, 44),
                                display: loading ? 'none' : 'block'
                            }}
                            src=""
                            id={'video_preview'}
                        ></video>

                        {sources.map(source => {
                            return (
                                <video
                                    key={source.id}
                                    style={{
                                        marginLeft: 16,
                                        width,
                                        height,
                                        display: 'none'
                                    }}
                                    src=""
                                    id={getVideoId(source)}
                                ></video>
                            );
                        })}
                    </View>

                    <View hide={!loading} center wh100p absFull>
                        <View loading></View>
                    </View>
                </ViewWithSize>
                <View abs zIdx={1111} bottom={6} right={12} left={12} rowVCenter jSpaceBetween>
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
                        ) && <View textSmall textColor="green" text={'正在推送'}></View>}

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
                            mr12
                            useSelectText
                            textProps={{
                                sx: {
                                    userSelect: 'text'
                                }
                            }}
                            textSmall
                            textColor="#666"
                            text={`ID: ${device?.deviceId}`}
                        ></View>
                        <View
                            textSmall
                            textColor="#666"
                            text={`x: ${x} y: ${y} / w: ${width} h: ${height}`}
                        ></View>
                    </View>
                </View>
            </View>

            <View
                abs
                left0
                w={240}
                top={0}
                bottom={0}
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
                    <View rowVCenter jStart w100p h={44}>
                        <View mt12 ml12 textSmall textColor="#888" text={'桌面屏幕'}></View>
                    </View>
                    <View column mt={8} mb={6} w100p aCenter>
                        <View
                            list
                            sx={{
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
                        rowVCenter
                        jStart
                        w100p
                        h={32}
                        hide={sources.filter(row => !row.display_id).length === 0}
                    >
                        <View ml12 textSmall textColor="#888" text={'程序屏幕'}></View>
                    </View>
                </View>
                <View flex1 relative hide={sources.filter(row => !row.display_id).length === 0}>
                    <View absFull overflowYAuto>
                        <View w100p ml={8}>
                            <View
                                list
                                sx={{
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
