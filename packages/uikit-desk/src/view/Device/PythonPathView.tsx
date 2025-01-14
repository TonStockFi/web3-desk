import { FormControl, FormLabel } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { useLocalStorageState } from '@web3-explorer/utils';
import { useEffect } from 'react';
import AppAPI from '../../common/AppApi';

export default function PythonPathView() {
    const [pythonPath, setPythonPath] = useLocalStorageState('pythonPath', '');
    useEffect(() => {
        if (pythonPath) {
            AppAPI.pythonPath = pythonPath;
        }
    }, [pythonPath]);
    return (
        <Card sx={{ width: '100%', position: 'reletive' }}>
            <CardContent>
                <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">Python路径</FormLabel>
                    <TextField
                        rows={1}
                        maxRows={1}
                        sx={{ width: 300, mt: 2 }}
                        placeholder="请按使用文档配置Python路径"
                        onChange={e => {
                            setPythonPath(e.target.value);
                        }}
                        value={pythonPath}
                    ></TextField>
                </FormControl>
            </CardContent>
        </Card>
    );
}
