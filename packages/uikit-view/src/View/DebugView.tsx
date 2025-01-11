import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import * as React from 'react';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import Select, { SelectChangeEvent } from '@web3-explorer/uikit-mui/dist/mui/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Fab from '@mui/material/Fab';

export function NativeSelectView({
    setPosition,
    position
}: {
    setPosition: any;
    position: string;
}) {
    return (
        <Box sx={{ width: '120px', position: 'absolute', top: 6, right: 2 }}>
            <FormControl size="small">
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={position}
                    sx={{ color: 'white' }}
                    onChange={(e: SelectChangeEvent) => {
                        const value = e.target.value;
                        setPosition(value);
                    }} variant={"standard"}>
                    <MenuItem value={'top'}>top</MenuItem>
                    <MenuItem value={'bottom'}>bottom</MenuItem>
                    <MenuItem value={'left'}>left</MenuItem>
                    <MenuItem value={'right'}>right</MenuItem>
                </Select>
            </FormControl>
            <IconButton size="small" onClick={()=>setPosition("close")} aria-label="delete">
                <CloseIcon sx={{ color: 'white' }}/>
            </IconButton>
        </Box>
    );
}

const getPosition = (value: string) => {
    let position;
    switch (value) {
        case 'top':
            position = { left: 0, right: 0, top: 0, height: '30%' };
            break;
        case 'bottom':
            position = { left: 0, right: 0, bottom: 0, height: '30%' };
            break;
        case 'left':
            position = { left: 0, bottom: 0, top: 0, width: '30%' };
            break;
        case 'right':
            position = { right: 0, bottom: 0, top: 0, width: '30%' };
            break;
        case 'close':
            position = { backgroundColor: 'rgba(0,0,0,0)',right: 4, bottom: 4, width: '40px', height: '40px'};
            break;
    }
    return position;
};
export function DebugView({ value }: { value: any }) {
    const [position, setPosition] = useState(localStorage.getItem("__debug_view")||"bottom");
    return (
        <Box
            sx={{
                overflowY: 'auto',
                p: 2,
                pt: 4,
                backgroundColor: 'rgba(0,0,0,0.8)',
                position: 'fixed',
                zIndex: 1,
                ...getPosition(position)
            }}
        >
            {
                position === "close" &&  <Fab onClick={()=>{
                    const val = localStorage.getItem("__debug_view") || "bottom"
                    setPosition(val === "close" ? "bottom" : val)
                }} size="small" color="secondary" aria-label="add">
                    <OpenInNewIcon />
                </Fab>
            }
            {
                position !== "close" &&  (
                    <>
                        <Typography component="pre" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(value, null, 2)}
                        </Typography>
                        <NativeSelectView setPosition={(value:string)=>{
                            localStorage.setItem('__debug_view', value);
                            setPosition(value)
                        }} position={position} />
                    </>
                )
            }
        </Box>
    );
}
