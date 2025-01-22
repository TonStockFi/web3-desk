import * as React from 'react';
import { isDesktop } from '../common/utils';
import DesktopPage from './DesktopPage';
import { MobilePage } from './MobilePage';
import { ScreenShareProvider } from './ScreenShareProvider';

export const KEY_DEVICE_ID = 'device_device_id_1';
export const KEY_PASSWORD = 'device_password';

export default function App() {
    React.useEffect(() => {
        const loading = document.querySelector('#__loading');
        //@ts-ignore
        document.body.style.appRegion = 'unset';
        //@ts-ignore
        if (loading) loading.style.display = 'none';
    }, []);

    if (isDesktop()) {
        return (
            <ScreenShareProvider>
                <DesktopPage />
            </ScreenShareProvider>
        );
    } else {
        return (
            <ScreenShareProvider>
                <MobilePage />
            </ScreenShareProvider>
        );
    }
}
