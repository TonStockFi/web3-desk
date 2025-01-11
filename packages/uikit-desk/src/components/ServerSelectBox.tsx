import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import { View } from '@web3-explorer/uikit-view/dist/View';
import * as React from 'react';
import AppAPI from '../common/AppApi';
import ServerApi from '../common/ServerApi';

export default function ServerSelectBox({
    onChangeApi,
    appAPI
}: {
    appAPI: AppAPI;
    onChangeApi: any;
}) {
    const [api, setApi] = React.useState(ServerApi.getServerApi);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ padding: 2 }}>
                <View hide center mb12>
                    <View
                        w100p
                        buttonContained={'扫描服务端地址'}
                        onClick={() => {
                            appAPI.start_scanner();
                        }}
                    ></View>
                </View>
                <View mt={24}>
                    <View textColor="#666" text={api}></View>
                </View>
            </Box>
        </Box>
    );
}
