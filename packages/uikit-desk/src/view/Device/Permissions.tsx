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

export default function Permissions({
    screenRecordingIsAuthed,
    serviceInputIsOpen,
    handleMediaService,
    serviceMediaIsRunning,
    handleInputService
}: {
    screenRecordingIsAuthed: boolean;
    handleMediaService: any;
    handleInputService: any;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    if (isDesktop()) {
        return (
            <View relative column>
                <View absFull zIdx={1} top={serviceMediaIsRunning ? 80 : 22}></View>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">权限</FormLabel>
                    {serviceMediaIsRunning && (
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
                            control={<Switch readOnly checked={serviceInputIsOpen} name="input" />}
                            label="输入控制"
                        />
                    </FormGroup>
                </FormControl>
            </View>
        );
    }
    return (
        <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">权限</FormLabel>
            {serviceMediaIsRunning && (
                <Box sx={{ mt: 2, mb: 4 }}>
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
                    sx={{ mb: 0.5 }}
                    control={
                        <Switch
                            checked={serviceMediaIsRunning}
                            onClick={handleMediaService}
                            name="service"
                        />
                    }
                    label="屏幕录制"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={serviceInputIsOpen}
                            onClick={handleInputService}
                            name="input"
                        />
                    }
                    label="输入控制"
                />
            </FormGroup>
        </FormControl>
    );
}
