import { View } from '@web3-explorer/uikit-view/dist/View';
import { useLocalStorageState, useTimeoutLoop } from '@web3-explorer/utils';
import { useEffect, useState } from 'react';
import AppAPI from '../common/AppApi';
import ManagerClients from '../view/Device/ManagerClients';
import TabViewContainer from './TabViewContainer';

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
    const [listType, setListType] = useState(0);

    // console.log(ip, server_is_ready);
    return (
        <View position={'fixed'} absFull top={12} bottom={55}>
            <View absFull top={0} overflowYAuto sx={{ color: '#666' }} px12 borderBox>
                <TabViewContainer
                    currentTabIndex={listType}
                    onChangeTabIndex={(v: number) => {
                        setListType(v);
                    }}
                    tabs={[{ title: '屏幕通道' }, { title: '指令通道' }]}
                />
                <View absFull top={58} overflowYAuto>
                    {listType === 0 && (
                        <ManagerClients
                            port={6788}
                            serverIsReady={server_is_ready}
                            ip={ip}
                            setServerIsReady={setServer_is_ready}
                        ></ManagerClients>
                    )}

                    {listType === 1 && (
                        <ManagerClients
                            port={6789}
                            serverIsReady={server_is_ready}
                            ip={ip}
                            setServerIsReady={setServer_is_ready}
                        ></ManagerClients>
                    )}
                </View>
            </View>
        </View>
    );
}
