import CheckIcon from '@mui/icons-material/Check';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import CircularProgress from '@web3-explorer/uikit-mui/dist/mui/CircularProgress';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useScreenShareContext } from '../../pages/ScreenShareProvider';
import DesktopDevices, { DeviceConnect } from '../../pages/service/DesktopDevices';
import WebSocketAndroidClient from '../../pages/service/WebSocketAndroidClient';

export default function StatusCard({ winId }: { winId: string }) {
    const { updateAt } = useScreenShareContext();
    const device = new DesktopDevices(winId);
    const state = device.getState();
    const deviceInfo = device.getInfo()!;
    const wsClient = deviceInfo!.wsClient as WebSocketAndroidClient;
    let dataChannel_chat_state,
        dataChannel_screen_state,
        dataChannel_control_state,
        peerConnection_state,
        connectionState,
        signalingState,
        iceGatheringState,
        iceConnectionState;
    if (wsClient) {
        const { dataChannel_chat, dataChannel_screen, dataChannel_control, peerConnection } =
            wsClient;
        dataChannel_chat_state = dataChannel_chat?.readyState;
        dataChannel_screen_state = dataChannel_screen?.readyState;
        dataChannel_control_state = dataChannel_control?.readyState;
        connectionState = peerConnection?.connectionState;
        signalingState = peerConnection?.signalingState;
        iceGatheringState = peerConnection?.iceGatheringState;
        iceConnectionState = peerConnection?.iceConnectionState;
    }
    const Icon = ({ ok }: { ok: boolean }) => {
        return (
            <View rowVCenter>
                {ok ? (
                    <CheckIcon fontSize={'small'} sx={{ color: 'green' }} />
                ) : (
                    <WarningAmberIcon fontSize={'small'} sx={{ color: 'red' }} />
                )}
            </View>
        );
    };
    if (deviceInfo.connected !== DeviceConnect.Connected) {
        return null;
    }
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <View hide json={state}></View>
                <View hide json={deviceInfo}></View>
                <View column w100p pr12 borderBox hide={deviceInfo.clientConnected}>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={false} />
                            <View ml12 textFontSize="0.9rem" text={'未有客户端连接'} mr12></View>
                        </View>
                    </View>
                </View>
                <View column w100p pr12 borderBox hide={!deviceInfo.clientConnected}>
                    <View rowVCenter jSpaceBetween hide={!deviceInfo.serviceMediaIsRunning}>
                        <View rowVCenter>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CircularProgress size={14} />
                            </Box>
                            <View textSmall ml={16} text={'正在推送'} mr12></View>
                        </View>
                    </View>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={connectionState === 'connected'} />
                            <View ml12 textFontSize="0.9rem" text={'连接状态'} mr12></View>
                        </View>
                        <View text={connectionState}></View>
                    </View>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={iceGatheringState === 'complete'} />
                            <View ml12 textFontSize="0.9rem" text={'ICE收集'} mr12></View>
                        </View>
                        <View text={iceGatheringState}></View>
                    </View>

                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={iceConnectionState === 'connected'} />
                            <View ml12 textFontSize="0.9rem" text={'ICE连接'} mr12></View>
                        </View>
                        <View text={iceConnectionState}></View>
                    </View>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={dataChannel_screen_state === 'open'} />
                            <View ml12 textFontSize="0.9rem" text={'屏幕通道'} mr12></View>
                        </View>
                        <View text={dataChannel_screen_state}></View>
                    </View>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={dataChannel_control_state === 'open'} />
                            <View ml12 textFontSize="0.9rem" text={'指令通道'} mr12></View>
                        </View>
                        <View text={dataChannel_control_state}></View>
                    </View>
                    <View rowVCenter jSpaceBetween>
                        <View rowVCenter mr12>
                            <Icon ok={dataChannel_chat_state === 'open'} />
                            <View ml12 textFontSize="0.9rem" text={'聊天通道'} mr12></View>
                        </View>
                        <View text={dataChannel_chat_state}></View>
                    </View>
                </View>
            </CardContent>
        </Card>
    );
}
