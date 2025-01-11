import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle
} from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import Stack from '@web3-explorer/uikit-mui/dist/mui/Stack';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';

import { ConfirmationDialogProps } from '../View/types';

export function ConfirmationDialog(props: ConfirmationDialogProps) {
    let {
        onCancel,
        confirming,
        confirmTxt,
        titleIcon,
        onConfirm,
        cancelTxt,
        content,
        title,
        open,
        id,
        ...other
    } = props;
    if (!id) {
        id = 'confirm_dialog';
    }
    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: 360, maxHeight: 435 } }}
            maxWidth="xs"
            open={!!open}
            id={id}
            {...other}
        >
            {title && (
                <DialogTitle>
                    {titleIcon ? (
                        <Stack direction="row" spacing={1}>
                            <Box>{titleIcon}</Box>
                            <Typography variant="inherit">{title}</Typography>
                        </Stack>
                    ) : (
                        <Typography variant="inherit">{title}</Typography>
                    )}
                </DialogTitle>
            )}

            <DialogContent dividers>
                {typeof content === 'string' ? <Typography>{content}</Typography> : content}
            </DialogContent>
            <DialogActions>
                {onCancel && <Button onClick={onCancel}>{cancelTxt ? cancelTxt : 'Cancel'}</Button>}

                {onConfirm && (
                    <Button
                        disabled={confirming}
                        onClick={() => {
                            if (onConfirm) {
                                const res = onConfirm();
                                if (!res) {
                                    onCancel && onCancel();
                                }
                            } else {
                                onCancel && onCancel();
                            }
                        }}
                    >
                        {confirmTxt ? confirmTxt : 'OK'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
