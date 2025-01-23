import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Permissions from './Permissions';

export default function PermissionsCard({
    serviceInputIsOpen,
    screenRecordingIsAuthed,
    handleMediaService,
    handleInputService,
    connected,
    onStopService,
    serviceMediaIsRunning
}: {
    onStopService: () => void;
    screenRecordingIsAuthed: boolean;
    connected: number;
    handleInputService: any;
    handleMediaService: any;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Permissions
                    onStopService={onStopService}
                    connected={connected}
                    screenRecordingIsAuthed={screenRecordingIsAuthed}
                    handleInputService={handleInputService}
                    handleMediaService={handleMediaService}
                    serviceInputIsOpen={serviceInputIsOpen}
                    serviceMediaIsRunning={serviceMediaIsRunning}
                />
            </CardContent>
        </Card>
    );
}
