import { createContext, ReactNode, useContext, useState } from 'react';
import AppAPI from '../common/AppApi';

export const handleState = async () => {
    const res = await new AppAPI().check_state();
    const {
        accessibilityStatus,
        screenRecordingIsAuthed,
        serviceInputIsOpen,
        screenRecordingStatus
    } = res || {};
    AppAPI.serviceInputIsOpen = !!serviceInputIsOpen;
    AppAPI.screenRecordingStatus = screenRecordingStatus;
    AppAPI.accessibilityStatus = accessibilityStatus;
    AppAPI.screenRecordingIsAuthed = screenRecordingIsAuthed;
};

interface ScreenShareContextType {
    updateAt: number;
    onUpdateAt: () => void;
}

const ScreenShareContext = createContext<ScreenShareContextType | undefined>(undefined);
export const useScreenShareContext = () => {
    const context = useContext(ScreenShareContext);
    if (!context) {
        throw new Error('useScreenShareContext must be used within an ScreenShareProvider');
    }
    return context;
};
export const ScreenShareProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};

    const [updateAt, setUpdatedAt] = useState(0);

    const onUpdateAt = () => setUpdatedAt(+new Date());
    return (
        <ScreenShareContext.Provider
            value={{
                onUpdateAt,
                updateAt
            }}
        >
            {children}
        </ScreenShareContext.Provider>
    );
};
