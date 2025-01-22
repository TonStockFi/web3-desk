import AppAPI from '../../common/AppApi';
import { isDesktop, updateApp } from '../../common/utils';
import WebSocketAndroidClient from './WebSocketAndroidClient';
import WebSocketClient from './WebSocketClient';
import WebSocketCtlClient from './WebSocketCtlClient';

export const KEY_DEVICE_ID = 'device_device_id_1';
export const KEY_PASSWORD = 'device_password';
export const Devices: Map<string, DeviceInfo> = new Map();

export interface DeviceInfo {
    winId: string;
    connected?: number;
    serviceMediaIsRunning?: boolean;
    deviceId?: string;
    password?: string;
    wsClient?: WebSocketClient | WebSocketAndroidClient | null;
}

export function updateDevices(winId: string, device: Partial<DeviceInfo>) {
    const existingDevice = Devices.get(winId) || { winId };

    const updatedDevice: DeviceInfo = {
        ...existingDevice,
        ...device
    };
    Devices.set(winId, updatedDevice);
}

export function saveDevices() {
    localStorage.setItem(
        'desktopDevices',
        JSON.stringify(
            Array.from(Devices).map(row => {
                const { winId, deviceId, password } = row[1] as DeviceInfo;
                return [winId, { winId, deviceId, password }];
            })
        )
    );
}

export function loadDevices() {
    const storedDevices = localStorage.getItem('desktopDevices');
    if (!storedDevices) return new Map();

    try {
        const parsedDevices: [string, DeviceInfo][] = JSON.parse(storedDevices);
        Devices.clear(); // Clear existing devices before loading
        parsedDevices.forEach(([key, value]) => {
            Devices.set(key, value);
        });
    } catch (error) {
        console.error('Error parsing stored devices:', error);
        return new Map();
    }
}

export enum DeviceConnect {
    Inited = -2,
    Connecting = 0,
    Closed = -1,
    Connected = 1
}

export default class DesktopDevices {
    connected: DeviceConnect = DeviceConnect.Inited;
    serviceMediaIsRunning: boolean = false;
    winId: string;
    constructor(winId: string) {
        this.winId = winId;
    }

    updateDesktopDevice(device: Partial<DeviceInfo>) {
        updateDevices(this.winId, device);
        updateApp();
    }

    setWsClient(wsClient: null | WebSocketClient | WebSocketAndroidClient) {
        this.updateDesktopDevice({ wsClient });
    }
    setConnected(connected: DeviceConnect) {
        // console.log(this.winId,{connected},this.getState())
        this.updateDesktopDevice({ connected });
    }
    setServiceMediaIsRunning(serviceMediaIsRunning: boolean) {
        this.serviceMediaIsRunning = serviceMediaIsRunning;
        // console.log(this.winId,{serviceMediaIsRunning},this.getState())
        this.updateDesktopDevice({ serviceMediaIsRunning });
    }
    getInfo() {
        return Devices.get(this.winId)!;
    }
    getState() {
        let serviceInputIsOpen = AppAPI.serviceInputIsOpen;

        if (isDesktop()) {
            serviceInputIsOpen = WebSocketCtlClient.inputIsOpen();
        }

        const screenRecordingIsAuthed = AppAPI.screenRecordingIsAuthed;
        const device = Devices.get(this.winId);
        // console.log("getState",{device})
        let serviceMediaIsRunning = false;
        let connected = DeviceConnect.Inited;
        if (device) {
            serviceMediaIsRunning =
                device.serviceMediaIsRunning !== undefined ? device.serviceMediaIsRunning : false;
            connected = device.connected !== undefined ? device.connected : DeviceConnect.Inited;
        }

        return { screenRecordingIsAuthed, serviceInputIsOpen, serviceMediaIsRunning, connected };
    }
}
