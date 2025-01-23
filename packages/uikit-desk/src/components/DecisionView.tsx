import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useRef, useState } from 'react';
import { Mobile_Device_Id } from '../constant';
import DesktopDevices from '../pages/service/DesktopDevices';
import WebSocketAndroidClient from '../pages/service/WebSocketAndroidClient';

function dataURIToArrayBuffer(dataURI: string) {
    // Remove header (e.g., "data:image/png;base64,")
    const base64String = dataURI.split(',')[1];

    // Decode Base64 string to binary string
    const binaryString = atob(base64String);

    // Create an ArrayBuffer
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);

    // Fill the buffer with binary data
    for (let i = 0; i < len; i++) {
        view[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}

export default function DecisionView() {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [screenImage, setScreenImage] = useState('');
    const device = new DesktopDevices(Mobile_Device_Id);
    useEffect(() => {
        function on_screen_image(e: any) {
            const { dataUri } = e.detail;
            setScreenImage(dataUri);
        }
        window.addEventListener('on_screen_image', on_screen_image);
        return () => {
            window.removeEventListener('on_screen_image', on_screen_image);
        };
    }, []);
    const wsClient = device.getInfo().wsClient as WebSocketAndroidClient;

    return (
        <View center column overflowYAuto bgColor="#3b3b3b">
            <View w={180} h={400} center mb12 column>
                <img
                    ref={imgRef}
                    onLoad={() => {
                        // const arrayBuffer = dataURIToArrayBuffer(screenImage);
                        wsClient && wsClient.sendChannalScreenMessage(screenImage);
                    }}
                    src={screenImage}
                    style={{ width: '100%', height: '100%' }}
                    alt=""
                />
            </View>
        </View>
    );
}
