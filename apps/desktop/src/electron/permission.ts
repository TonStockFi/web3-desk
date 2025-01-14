import { getAuthStatus } from 'node-mac-permissions';

export const getMacPermission = ()=>{
    const screenRecordingStatus = getAuthStatus('screen');
    const accessibilityStatus = getAuthStatus('accessibility');
    return {
        screenRecordingStatus,
        accessibilityStatus,
        screenRecordingIsAuthed: screenRecordingStatus === 'authorized',
        serviceInputIsOpen: accessibilityStatus === 'authorized'
    };
}