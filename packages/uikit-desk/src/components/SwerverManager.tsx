import { View } from '@web3-explorer/uikit-view/dist/View';
import { useLocalStorageState, useTimeoutLoop } from '@web3-explorer/utils';
import { useEffect } from 'react';
import AppAPI from '../common/AppApi';
import ManagerClients from '../view/Device/ManagerClients';

export default function SwerverManager() {
    const [ip, setIp] = useLocalStorageState('ip', '');
    const [server_is_ready, setServer_is_ready] = useLocalStorageState('server_is_ready', false);
    useEffect(() => {
        new AppAPI().get_env().then(res => {
            console.log('get_env', res);
            if (res.ip && res.ip.adr) {
                setIp(res.ip.adr);
            }
        });
    }, []);
    useTimeoutLoop(async () => {
        new AppAPI().server_is_ready().then((r: boolean) => {
            setServer_is_ready(r);
        });
    });
    // console.log(ip, server_is_ready);
    return (
        <View position={'fixed'} absFull top={44} bottom={55}>
            <View absFull top={0} pt12 overflowYAuto sx={{ color: '#666' }} px12 borderBox>
                <ManagerClients
                    serverIsReady={server_is_ready}
                    ip={ip}
                    setServerIsReady={setServer_is_ready}
                ></ManagerClients>
            </View>
        </View>
    );
}
