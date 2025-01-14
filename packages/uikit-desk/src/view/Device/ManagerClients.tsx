import Chip from '@web3-explorer/uikit-mui/dist/mui/Chip';
import Paper from '@web3-explorer/uikit-mui/dist/mui/Paper';
import Table from '@web3-explorer/uikit-mui/dist/mui/Table';
import TableBody from '@web3-explorer/uikit-mui/dist/mui/TableBody';
import TableCell from '@web3-explorer/uikit-mui/dist/mui/TableCell';
import TableContainer from '@web3-explorer/uikit-mui/dist/mui/TableContainer';
import TableHead from '@web3-explorer/uikit-mui/dist/mui/TableHead';
import TableRow from '@web3-explorer/uikit-mui/dist/mui/TableRow';
import { useCallback, useEffect, useState } from 'react';

import { View } from '@web3-explorer/uikit-view';
import { useInterval } from '@web3-explorer/utils';
import { connectWebSocket, wsSendClose, wsSendMessage } from '../../common/ws';
import { WsCloseCode } from '../../types';

export default function ManagerClients({
    serverIsReady,
    ip,
    port,
    setServerIsReady
}: {
    port: number;
    ip: string;
    serverIsReady: boolean;
    setServerIsReady: (v: boolean) => void;
}) {
    const WS_URL = `ws://127.0.0.1:${port}`;

    const [clients, setClients] = useState([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    useEffect(() => {
        function onServerIsReady(e: any) {
            console.log('serverIsReady', e.detail.serverIsReady);
            setServerIsReady(e.detail.serverIsReady);
            setClients([]);
            if (e.detail.serverIsReady) {
                setWs(null);
            }
        }
        window.addEventListener('onServerIsReady', onServerIsReady);
        return () => {
            window.removeEventListener('onServerIsReady', onServerIsReady);
        };
    }, []);
    useInterval(() => {
        if (ws && serverIsReady) wsSendMessage({ action: 'getClients' }, ws);
    }, 2000);

    const onMessage = useCallback(
        async ({ action, payload }: { action: string; payload: any }, ws: WebSocket) => {
            if (action === 'getClients') {
                setClients(payload.clients);
            }
            if (action === 'logged') {
                console.log('logged', port);
                wsSendMessage({ action: 'getClients' }, ws);
            }
        },
        []
    );

    const onClose = useCallback(async ({ code, reason }: { code: number; reason: string }) => {
        console.log('onClose', port);
    }, []);

    useEffect(() => {
        if (!ws && serverIsReady)
            connectWebSocket(WS_URL, {
                onLogged: {
                    action: 'registerManager',
                    payload: { platform: 'WEB' }
                },
                onMessage,
                onClose
            })
                .then(ws => {
                    setWs(ws);
                })
                .catch(console.error);

        return () => {
            if (ws) wsSendClose(WsCloseCode.WS_CLOSE_STOP_RECONNECT, 'WS_CLOSE_STOP_RECONNECT', ws);
        };
    }, [ws, serverIsReady]);
    const connected = clients.find((client: any) => client.manager);
    return (
        <View userSelectNone>
            <View px12 borderBox w100p rowVCenter jSpaceBetween h={44} mb12>
                <View>
                    <View text={'会话'}></View>
                </View>
                <View rowVCenter jEnd pr12 hide={!connected}>
                    <View mr12 textSmall text="服务端地址"></View>
                    <View useSelectText>{WS_URL.replace('127.0.0.1', ip)}</View>
                </View>
                <View rowVCenter jEnd pr12 hide={connected}>
                    <View mr12 textSmall text="正在连接"></View>
                </View>
            </View>
            <View
                sx={{
                    '& .MuiPaper-root': {
                        // bgcolor: theme.backgroundBrowser,
                        // color: theme.textPrimary
                    }
                }}
            >
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>设备ID</TableCell>
                                <TableCell align="right">类型</TableCell>
                                <TableCell align="right">平台</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients
                                // .filter((client: any) => !client.manager)
                                .map((session: any) => (
                                    <TableRow
                                        key={session.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell>
                                            <View useSelectText>
                                                {session.manager && (
                                                    <Chip
                                                        label="1001"
                                                        size={'small'}
                                                        variant="filled"
                                                    />
                                                )}
                                                {session.device && `${session.device.deviceId}`}
                                                {session.client && `${session.client.deviceId}`}
                                            </View>
                                        </TableCell>
                                        <TableCell align="right">
                                            {session.device && (
                                                <Chip
                                                    label="推送端"
                                                    size={'small'}
                                                    color="primary"
                                                    variant="filled"
                                                />
                                            )}
                                            {session.client && (
                                                <Chip
                                                    label="接收端"
                                                    size={'small'}
                                                    color="error"
                                                    variant="filled"
                                                />
                                            )}

                                            {session.manager && (
                                                <Chip
                                                    label="管理端"
                                                    size={'small'}
                                                    color="warning"
                                                    variant="filled"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {session.device && `${session.device.platform}`}
                                            {session.client && `${session.client.platform}`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </View>
        </View>
    );
}
