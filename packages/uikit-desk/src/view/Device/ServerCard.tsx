import { FormControl, FormLabel } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { useState } from 'react';
import ServerApi from '../../common/ServerApi';

export default function ServerCard() {
    const [api, setApi] = useState(ServerApi.getServerApi());

    return (
        <Card sx={{ width: '100%', position: 'reletive' }}>
            <CardContent>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">服务端地址</FormLabel>
                    <TextField
                        rows={1}
                        maxRows={1}
                        multiline
                        sx={{ width: 300, mt: 2 }}
                        placeholder="请输入地址,以 ws:// 或者 wss://push.web3r.site 开头"
                        onChange={e => {
                            ServerApi.setServerApi(e.target.value);
                            setApi(e.target.value);
                        }}
                        value={api}
                    ></TextField>
                </FormControl>
            </CardContent>
        </Card>
    );
}
