import React from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export interface ConfirmationDialogProps {
    id: string;
    confirming?: boolean;
    titleIcon?: any;
    title?: string;
    confirmTxt?: string;
    content: string | any;
    keepMounted?: boolean;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmationDialog(props: ConfirmationDialogProps) {
    const {
        onCancel,
        confirming,
        confirmTxt,
        titleIcon,
        onConfirm,
        content,
        title,
        open,
        ...other
    } = props;

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: 360, maxHeight: 435 } }}
            maxWidth="xs"
            open={open}
            {...other}
        >
            {title && (
                <DialogTitle>
                    {titleIcon ? (
                        <Stack direction="row" spacing={1}>
                            <Box>{titleIcon}</Box>
                            <Typography>{title}</Typography>
                        </Stack>
                    ) : (
                        <Typography>{title}</Typography>
                    )}
                </DialogTitle>
            )}

            <DialogContent dividers>
                {typeof content === 'string' ? <Typography>{content}</Typography> : content}
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onCancel}>
                    取消
                </Button>
                <Button disabled={confirming} onClick={onConfirm}>
                    {confirmTxt ? confirmTxt : '确定'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
