import * as React from 'react';
import List from '@web3-explorer/uikit-mui/dist/mui/List';
import ListSubheader from '@web3-explorer/uikit-mui/dist/mui/ListSubheader';
import ListItem from '@web3-explorer/uikit-mui/dist/mui/ListItem';
import ListItemText from '@web3-explorer/uikit-mui/dist/mui/ListItemText';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function HostListView({
    defaultHosts,
    hosts,
    setHost
}: {
    defaultHosts: string[];
    setHost: any;
    hosts: string[];
}) {
    return (
        <List
            subheader={<ListSubheader>服务器</ListSubheader>}
            sx={{ mt: 2, width: '100%', bgcolor: 'background.paper' }}
        >
            {hosts.map(host => (
                <ListItem
                    sx={{ pl: 1 }}
                    key={host}
                    disableGutters
                    secondaryAction={
                        defaultHosts.indexOf(host) !== -1 ? null : (
                            <IconButton
                                onClick={() => {
                                    setHost(hosts.filter(h => h !== host));
                                }}
                                aria-label="comment"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                >
                    <ListItemText primary={host} />
                </ListItem>
            ))}
        </List>
    );
}
