import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import BottomNavigation from '@web3-explorer/uikit-mui/dist/mui/BottomNavigation';
import BottomNavigationAction from '@web3-explorer/uikit-mui/dist/mui/BottomNavigationAction';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';

export default function BottomNavigationView({
    tabId,
    setTabId
}: {
    tabId: string;
    setTabId: any;
}) {
    return null;
    return (
        <Box
            sx={{
                width: '100%',
                zIndex: 100000000,
                height: '54px',
                backgroundColor: 'white',
                borderTop: '1px solid #e9e9e9'
            }}
        >
            <BottomNavigation
                showLabels
                value={tabId}
                onChange={(event: any, newValue: any) => {
                    setTabId(newValue);
                }}
            >
                <BottomNavigationAction value={'link'} label="推送端" icon={<LinkIcon />} />
                <BottomNavigationAction value={'decision'} label="机器决策" icon={<PublicIcon />} />

                {/* <BottomNavigationAction value={'setting'} label="设置" icon={<SettingsIcon />} /> */}
            </BottomNavigation>
        </Box>
    );
}
