import * as React from 'react';
import { useState } from 'react';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import Dialog,{DialogTitle,DialogContent,DialogActions} from '@web3-explorer/uikit-mui/dist/mui/Dialog';

import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Snackbar from '@web3-explorer/uikit-mui/dist/mui/Snackbar';
import useMediaQuery from '@web3-explorer/uikit-mui/dist/mui/useMediaQuery';
import { useTheme } from '@web3-explorer/uikit-mui/dist/mui/styles';


import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import HostListView from './HostListView';

export default function AddServerApiDialog({
    setHosts,
    defaultHosts,
    hosts
}: {
    defaultHosts: string[];
    setHosts: any;
    hosts: string[];
}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = React.useState(false);
    const [openSnake, setOpenSnake] = useState('');
    const [value, setValue] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
        setValue('');
    };

    const handleClose = () => {
        setValue('');
        setOpen(false);
    };

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setOpenSnake('')}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );
    return (
        <React.Fragment>
            <Button
                sx={{ width: '100%', mt: 2 }}
                startIcon={<PlaylistAddIcon />}
                color="primary"
                variant="contained"
                onClick={handleClickOpen}
            >
                添加服务器
            </Button>
            <Dialog
                open={open}
                fullScreen={fullScreen}
                maxWidth={'md'}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const api = formJson.api;
                        if (api) {
                            if (api.startsWith('ws') || api.startsWith('http')) {
                                if (hosts.indexOf(api) === -1) {
                                    setHosts([api, ...hosts]);
                                } else {
                                    setOpenSnake('服务器已存在');
                                }
                            }
                        }
                        handleClose();
                    }
                }}
            >
                <DialogTitle>添加服务器</DialogTitle>
                <DialogContent sx={{ minWidth: fullScreen ? undefined : '360px' }}>
                    {/*<DialogContentText>Add a server</DialogContentText>*/}
                    <Box>
                        <TextField
                            autoFocus
                            required
                            value={value}
                            margin="dense"
                            id="api"
                            name="api"
                            label="服务器地址"
                            type="url"
                            fullWidth
                            onChange={e => {
                                setValue(e.target.value);
                            }}
                            variant="standard"
                        />
                    </Box>
                    <HostListView defaultHosts={defaultHosts} hosts={hosts} setHost={setHosts} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">添加</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={!!openSnake}
                autoHideDuration={6000}
                onClose={() => setOpenSnake('')}
                message={openSnake}
                action={action}
            />
        </React.Fragment>
    );
}
