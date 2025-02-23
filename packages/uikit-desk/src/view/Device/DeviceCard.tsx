import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { generateRandomPassword } from '../../common/utils';
import { useScreenShareContext } from '../../pages/ScreenShareProvider';
import DesktopDevices, {
    DeviceConnect,
    saveDevices,
    updateDevices
} from '../../pages/service/DesktopDevices';

export default function DeviceCard({
    deviceId,
    onStopService,
    connected,
    winId,
    handleMediaService,
    password
}: {
    onStopService: () => void;
    winId: string;
    handleMediaService: any;
    connected: number;
    password: string;
    deviceId: string;
}) {
    const { updateAt } = useScreenShareContext();
    const device = new DesktopDevices(winId);
    const { retry_count } = device.getInfo();
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                    <FormLabel component="legend">设备</FormLabel>
                    <View rowVCenter mb12>
                        <View w={'50%'}>
                            <Box sx={{ mb: 0.5, mt: 1 }}>
                                <Stack direction="row" spacing={2} sx={{ pl: 1, mb: 0 }}>
                                    <Box sx={{ pt: 0 }}>
                                        <PersonIcon
                                            fontSize={'small'}
                                            sx={{ color: 'text.secondary' }}
                                        />
                                    </Box>
                                    <Typography
                                        sx={{
                                            color: 'text.secondary',
                                            fontWidth: 700,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        识别码
                                    </Typography>
                                </Stack>
                                <Box sx={{ pl: 1, pt: 0.5 }}>
                                    <Typography
                                        sx={{
                                            userSelect: 'text',
                                            letterSpacing: 2,
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            fontSize: '1.2rem'
                                        }}
                                    >
                                        {deviceId.replace(/\s+/g, '')}
                                    </Typography>
                                </Box>
                            </Box>
                        </View>
                        <View w={'50%'}>
                            <Box sx={{ mb: 0.5, mt: 1 }}>
                                <Stack direction="row" spacing={2} sx={{ pl: 1, mb: 0 }}>
                                    <Box sx={{ pt: 0 }}>
                                        <LockIcon
                                            fontSize={'small'}
                                            sx={{ color: 'text.secondary' }}
                                        />
                                    </Box>
                                    <Typography
                                        sx={{
                                            color: 'text.secondary',
                                            fontWidth: 700,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        密码
                                    </Typography>
                                </Stack>
                                <View pl={4} pr={4} rowVCenter jSpaceBetween>
                                    <View rowVCenter pt={4}>
                                        <Typography
                                            sx={{
                                                userSelect: 'text',
                                                letterSpacing: 2,
                                                color: 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            {Boolean(
                                                connected === DeviceConnect.Closed ||
                                                    connected === DeviceConnect.Inited
                                            )
                                                ? '*******'
                                                : password}
                                        </Typography>
                                    </View>
                                    <View
                                        hide={Boolean(
                                            connected === DeviceConnect.Closed ||
                                                connected === DeviceConnect.Inited
                                        )}
                                    >
                                        <IconButton
                                            sx={{
                                                '& .MuiSvgIcon-root ': { fontSize: '1.2rem' }
                                            }}
                                            onClick={() => {
                                                const password = generateRandomPassword();
                                                updateDevices(winId, { password });
                                                saveDevices();
                                                onStopService();
                                            }}
                                            size="small"
                                            aria-label="delete"
                                        >
                                            <ReplayIcon />
                                        </IconButton>
                                    </View>
                                </View>
                            </Box>
                        </View>
                    </View>
                    <Box sx={{ mb: 0, mt: 0 }}>
                        {connected === 1 && (
                            <View column w100p pr12 borderBox>
                                <View mr12>
                                    <Stack direction="row" spacing={2} sx={{ mt: 0.5, mb: 0.5 }}>
                                        <CheckIcon fontSize={'small'} sx={{ color: 'green' }} />
                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                fontWidth: 700,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            就绪
                                        </Typography>
                                    </Stack>
                                </View>
                                {/* <View hide={!serviceMediaIsRunning}>
                                    <Stack direction="row" spacing={3} sx={{ mt: 0.5, mb: 0.5 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <CircularProgress size={14} />
                                        </Box>
                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                fontWidth: 700,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            正在推送
                                        </Typography>
                                    </Stack>
                                </View> */}
                            </View>
                        )}
                        {connected === -1 && (
                            <Stack direction="row" spacing={2} sx={{ mb: 0, alignItems: 'center' }}>
                                <Button
                                    size="small"
                                    onClick={handleMediaService}
                                    startIcon={<PlayArrowIcon />}
                                    variant="contained"
                                >
                                    启动服务
                                </Button>
                                <WarningAmberIcon fontSize={'small'} sx={{ color: 'red' }} />

                                <Typography
                                    sx={{
                                        color: 'red',
                                        fontWidth: 600,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    连接失败
                                </Typography>
                            </Stack>
                        )}
                        {connected === -2 && (
                            <Stack direction="column" spacing={2} sx={{ mb: 0 }}>
                                <Button
                                    size="large"
                                    onClick={handleMediaService}
                                    startIcon={<PlayArrowIcon />}
                                    variant="contained"
                                >
                                    启动服务
                                </Button>
                                <View w={280}>
                                    <View
                                        px12
                                        textFontSize="0.8rem"
                                        text={'点击启动服务启用屏幕捕获权限，即可启动屏幕共享服务'}
                                    ></View>
                                </View>
                            </Stack>
                        )}
                        {connected === 0 && (
                            <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <CircularProgress size={16} />
                                </Box>
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        fontWidth: 700,
                                        fontSize: '1rem'
                                    }}
                                >
                                    {Boolean(retry_count && retry_count > 5)
                                        ? `连接中... (${retry_count})`
                                        : `连接中...`}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </FormControl>
            </CardContent>
        </Card>
    );
}
