import { MobileDeviceApp } from '@web3-explorer/uikit-desk';
import { View } from '@web3-explorer/uikit-view';
import { Buffer } from 'buffer';
import './App.css';
window.Buffer = Buffer;

function App() {
    return (
        <View sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <MobileDeviceApp />
        </View>
    );
}

export default App;
