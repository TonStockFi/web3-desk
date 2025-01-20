import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
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
import { View } from '@web3-explorer/uikit-view/dist/View';

export default function DeviceCard({
    deviceId,
    connected,
    // onRefreshPassword,
    serviceMediaIsRunning,
    handleMediaService,
    password
}: {
    serviceMediaIsRunning?: boolean;
    handleMediaService: any;
    connected: number;
    // onRefreshPassword: any;
    password: string;
    deviceId: string;
}) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                    <FormLabel component="legend">设备</FormLabel>
                    <Box sx={{ mb: 0.5, mt: 1 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 0 }}>
                            <Box sx={{ pt: 0 }}>
                                <PersonIcon fontSize={'small'} sx={{ color: 'text.secondary' }} />
                            </Box>
                            <Typography
                                sx={{ color: 'text.secondary', fontWidth: 700, fontSize: '1rem' }}
                            >
                                ID
                            </Typography>
                        </Stack>
                        <Box sx={{ pl: 5 }}>
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
                    <Box sx={{ mb: 1, mt: 0.5 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                            <Box sx={{ pt: 0.1 }}>
                                <LockIcon fontSize={'small'} sx={{ color: 'text.secondary' }} />
                            </Box>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontWidth: 700,

                                    fontSize: '1rem'
                                }}
                            >
                                一次性密码
                            </Typography>
                        </Stack>
                        <Box sx={{ pl: 5 }}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Typography
                                    sx={{
                                        userSelect: 'text',
                                        letterSpacing: 2,
                                        color: 'text.primary',
                                        fontWeight: 700,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {password}
                                </Typography>
                                {/*<Box sx={{ mt: -0.5 }}>*/}
                                {/*    <IconButton*/}
                                {/*        onClick={onRefreshPassword}*/}
                                {/*        size="small"*/}
                                {/*        aria-label="delete"*/}
                                {/*    >*/}
                                {/*        <ReplayIcon />*/}
                                {/*    </IconButton>*/}
                                {/*</Box>*/}
                            </Stack>
                        </Box>
                    </Box>
                    <Box sx={{ mb: 0, mt: 0 }}>
                        {connected === 1 && (
                            <>
                                <View>
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
                                <View hide={!serviceMediaIsRunning}>
                                    <Stack direction="row" spacing={2} sx={{ mt: 0.5, mb: 0.5 }}>
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
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            正在推送
                                        </Typography>
                                    </Stack>
                                </View>
                            </>
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
                                        fontWidth: 700,
                                        fontSize: '1rem'
                                    }}
                                >
                                    连接失败
                                </Typography>
                            </Stack>
                        )}
                        {connected === -2 && (
                            <Stack direction="column" spacing={2} sx={{ mb: 0 }}>
                                <Button
                                    size="small"
                                    onClick={handleMediaService}
                                    startIcon={<PlayArrowIcon />}
                                    variant="contained"
                                >
                                    启动服务
                                </Button>
                                <View>
                                    <View
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
                                    连接中...
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </FormControl>
            </CardContent>
        </Card>
    );
}
