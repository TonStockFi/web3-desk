import { Box, Button, FormControlLabel, FormGroup, FormLabel, Switch } from '@mui/material';
import CardContent from '@mui/material/CardContent/CardContent';
import FormControl from '@mui/material/FormControl/FormControl';
import Card from '@web3-explorer/uikit-mui/dist/mui/Card';
import { View } from '@web3-explorer/uikit-view';
import { formatNumber, isMac } from '../common/utils';

import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import AppAPI from '../common/AppApi';
import DeviceCard from '../view/Device/DeviceCard';
import { handleState, useScreenShareContext } from './ScreenShareProvider';

import DesktopDevices, { DeviceConnect } from './service/DesktopDevices';

export function QrCodeView({ text }: { text: string }) {
    return (
        <View w100p h100vh center>
            <View wh={200} center column>
                <QRCode
                    size={180}
                    value={text}
                    logoImage={'https://web3r.site/coin-256x256.png'}
                    logoPadding={8}
                    qrStyle="dots"
                    eyeRadius={{
                        inner: 2,
                        outer: 16
                    }}
                />
                <View mt12 text={'请使用 Web3 Desk 手机设备扫码连接'}></View>
            </View>
        </View>
    );
}
export default function DesktopShareView({
    deviceId,
    password,
    winId
}: {
    deviceId: string;
    winId: string;
    password: string;
}) {
    const { updateAt, onUpdateAt } = useScreenShareContext();

    useEffect(() => {
        handleState().then(() => onUpdateAt());
    }, []);

    const device = new DesktopDevices(winId);
    const { screenRecordingIsAuthed, serviceInputIsOpen, serviceMediaIsRunning, connected } =
        device.getState();
    console.log('winId', winId, { updateAt, connected, serviceMediaIsRunning });
    const handleMediaService = () => {
        const { screenRecordingIsAuthed, connected, serviceInputIsOpen } = device.getState();
        if (connected === DeviceConnect.Connected) {
            window.dispatchEvent(
                new CustomEvent('stop_service', {
                    detail: {
                        winId
                    }
                })
            );
            return;
        }
        if (!screenRecordingIsAuthed) {
            alert('启动服务前,请开启屏幕录制权限');
            return;
        }
        if (!serviceInputIsOpen) {
            alert('启动服务前,请开启输入控制');
            return;
        }
        window.dispatchEvent(
            new CustomEvent('init_service', {
                detail: {
                    winId
                }
            })
        );
    };
    return (
        <View absFull px={12} borderBox key={updateAt}>
            <View pt={0}>
                <View mb12>
                    <DeviceCard
                        handleMediaService={handleMediaService}
                        connected={connected}
                        password={password}
                        serviceMediaIsRunning={serviceMediaIsRunning}
                        deviceId={deviceId ? formatNumber(Number(deviceId)) : ''}
                    />
                </View>
            </View>
            <View mt12>
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <View relative column>
                            <FormControl component="fieldset" variant="standard">
                                <FormLabel component="legend">权限</FormLabel>
                                {connected === DeviceConnect.Connected && (
                                    <Box sx={{ mt: 1, mb: 2 }}>
                                        <Button
                                            onClick={handleMediaService}
                                            startIcon={<StopCircleIcon />}
                                            color="error"
                                            variant="contained"
                                        >
                                            停止服务
                                        </Button>
                                    </Box>
                                )}
                                <FormGroup>
                                    <FormControlLabel
                                        onClick={() => {
                                            if (isMac() && !screenRecordingIsAuthed) {
                                                new AppAPI().open_screen_recording_settings();
                                            }
                                        }}
                                        sx={{ mb: 0.5 }}
                                        control={
                                            <Switch
                                                readOnly
                                                onChange={() => {}}
                                                checked={screenRecordingIsAuthed}
                                                name="service"
                                            />
                                        }
                                        label="屏幕录制"
                                    />
                                    <FormControlLabel
                                        onClick={() => {
                                            if (!serviceInputIsOpen) {
                                                new AppAPI().open_ctl_server();
                                            }
                                        }}
                                        control={
                                            <Switch
                                                readOnly
                                                checked={serviceInputIsOpen}
                                                name="input"
                                            />
                                        }
                                        label="输入控制"
                                    />
                                </FormGroup>
                            </FormControl>
                        </View>
                    </CardContent>
                </Card>
            </View>
        </View>
    );
}
