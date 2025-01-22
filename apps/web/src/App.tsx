import { App as AppInner } from '@web3-desk/uikit-desk';
import { View } from '@web3-explorer/uikit-view';
import { Buffer } from 'buffer';
import './App.css';
window.Buffer = Buffer;

function App() {
    return (
        <View sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <AppInner />
        </View>
    );
}

export default App;
