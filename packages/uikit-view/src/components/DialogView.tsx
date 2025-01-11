import { DialogViewProps } from '../View/types';

import Dialog, { DialogContent } from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';

export function DialogView(props: DialogViewProps) {
    const { content, dialogProps } = props;

    return (
        <Dialog {...dialogProps}>
            <DialogContent sx={{ padding: 0, margin: 0 }}>
                {typeof content === 'string' ? (
                    <Typography fontSize={'0.9rem'}>{content}</Typography>
                ) : (
                    content
                )}
            </DialogContent>
        </Dialog>
    );
}

export default DialogView;
