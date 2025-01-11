import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ServiceStartCard({ handleMediaService }: { handleMediaService: any }) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Stack direction={'row'} spacing={1}>
                    <WarningAmberIcon sx={{ color: 'red' }} />
                    <Typography>服务未运行</Typography>
                </Stack>
                <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: 12 }}>
                        点击启动服务启用屏幕捕获权限，即可启动屏幕共享服务
                    </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Button
                        onClick={handleMediaService}
                        startIcon={<PlayArrowIcon />}
                        variant="contained"
                    >
                        启动服务
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
