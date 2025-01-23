import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

import StopCircleIcon from '@mui/icons-material/StopCircle';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { View } from '@web3-explorer/uikit-view';
import { isDesktop } from '../../common/utils';
import { DeviceConnect } from '../../pages/service/DesktopDevices';

export default function Permissions({
    screenRecordingIsAuthed,
    serviceInputIsOpen,
    handleMediaService,
    serviceMediaIsRunning,
    connected,
    onStopService,
    handleInputService
}: {
    onStopService: () => void;
    connected: number;
    screenRecordingIsAuthed: boolean;
    handleMediaService: any;
    handleInputService: any;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    return (
        <FormControl component="fieldset" variant="standard">
            <View hide={!isDesktop()} absFull zIdx={1} top={serviceMediaIsRunning ? 80 : 22}></View>
            <FormLabel component="legend">权限</FormLabel>
            {Boolean(connected === DeviceConnect.Connected) && (
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Button
                        onClick={onStopService}
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
                    sx={{ mb: 1.5, mt: 1.5 }}
                    control={
                        <Switch
                            readOnly={isDesktop()}
                            checked={screenRecordingIsAuthed}
                            onClick={isDesktop() ? undefined : handleMediaService}
                            name="service"
                        />
                    }
                    label="屏幕录制"
                />
                <FormControlLabel
                    control={
                        <Switch
                            readOnly={isDesktop()}
                            checked={serviceInputIsOpen}
                            onClick={isDesktop() ? undefined : handleInputService}
                            name="input"
                        />
                    }
                    label="输入控制"
                />
            </FormGroup>
        </FormControl>
    );
}
