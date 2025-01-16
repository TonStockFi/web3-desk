import { exec, spawn } from 'child_process';
import { app, BrowserWindow, desktopCapturer, ipcMain, screen, shell, Tray } from 'electron';
import contextMenu from 'electron-context-menu';
import isDev from 'electron-is-dev';

import screenshot from 'screenshot-desktop';

import path from 'path';
import { getMacPermission } from './permission';
import { delay } from './utils';
import { Action } from './ws-server/action';
import { getLocalIPAddress, WebSocketServerWrapper } from './ws-server/server';
const publicDir = path.resolve(__dirname, isDev ? '../../' : '../../../', 'public');

contextMenu({
    showInspectElement: isDev ? true : true,
    showSaveImageAs: true,
    showSearchWithGoogle: false,
    showLookUpSelection: false,
    showSelectAll: false
});


declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';
let authStatus: null | {
    screenRecordingStatus: string;
    accessibilityStatus: string;
    screenRecordingIsAuthed: boolean;
    serviceInputIsOpen: boolean;
} = null;

setInterval(() => {
    if (isWin) {
        authStatus = {
            ...authStatus,
            screenRecordingIsAuthed: true,
            serviceInputIsOpen: true
        };
    } else {
        authStatus = {
            ...authStatus,
            ...getMacPermission()
        };
    }
    // console.log({ authStatus });
}, 2000);

export abstract class MainWindow {
    static mainWindow: BrowserWindow | undefined = undefined;
    static tray: Tray;
    static createTray(name?: string) {
        if (!this.tray) {
            const tray = new Tray(path.join(process.cwd(), 'public', 'tray-icon.png'));
            tray.setToolTip(name || 'Web3 Explorer');
            tray.on('click', () => {
                console.log('tray clicked');
                const win = this.mainWindow;
                if (win.isMinimized()) {
                    win.restore();
                }
                win.show();
                win.focus();
            });
            this.tray = tray;
        }
    }
    static openScreenRecordingSettings() {
        exec(
            'open "x-apple.systempreferences:com.apple.preference.security"',
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error opening Screen Recording settings: ${error.message}`);
                    return;
                }
            }
        );
    }

    static getState() {
        return authStatus;
    }

    static async openMainWindow() {
        if (this.mainWindow !== undefined && this.mainWindow !== null) return this.mainWindow;
        const icon = (() => {
            switch (process.platform) {
                case 'darwin':
                    return path.join(process.cwd(), 'public', 'icon.icns');
                case 'linux':
                    return path.join(__dirname, '../../../', 'public', 'icon.png');
                case 'win32':
                    return path.join(process.cwd(), 'public', 'icon.ico');
                default:
                    return '';
            }
        })();

        this.mainWindow = new BrowserWindow({
            autoHideMenuBar: true,
            x: isDev ? 0 : undefined,
            y: isDev ? 0 : undefined,
            darkTheme: true,
            resizable: true,
            width: 360,
            minWidth: 360,
            height: 740,
            minHeight: 740,
            backgroundColor: '#232323',
            icon,
            webPreferences: {
                allowRunningInsecureContent: true,
                experimentalFeatures: false,
                spellcheck: false,
                nodeIntegration: true,
                contextIsolation: true,
                webviewTag: true,
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
            }
        });
        

        const url = isDev ? 'http://localhost:5173' : 'https://web3-desk.web3r.site';
        this.mainWindow.loadURL(url);
        this.mainWindow.show();
        
        ipcMain.handle('message', async (e: any, message: { action: string; payload: any }) => {
            const { action, payload } = message;
            switch (action) {
                case 'open_url': {
                    let { url } = payload;
                    await shell.openExternal(url);
                    break;
                }
                case 'get_env': {
                    const sessionPath = this.mainWindow.webContents.session.getStoragePath();
                    const { workAreaSize, workArea } = screen.getPrimaryDisplay();
                    const bounds = this.mainWindow.getBounds();
                    const isFullScreen = this.mainWindow.isFullScreen();
                    return {
                        bounds,
                        version: app.getVersion(),
                        sessionPath,
                        workAreaSize,
                        workArea,
                        dirname: __dirname,
                        ip: getLocalIPAddress(),
                        isMac,
                        isWin,
                        isFullScreen
                    };
                }

                case 'open_screen_recording_settings': {
                    await screenshot();
                    this.openScreenRecordingSettings();
                    return true;
                }

                case 'get_sources': {
                    let { types } = payload;
                    return await desktopCapturer.getSources({
                        types: types || ['window', 'screen']
                    });
                }
                case 'stop_server': {
                    return WebSocketServerWrapper.stopServer();
                }

                case 'server_is_ready': {
                    return WebSocketServerWrapper.serverIsReady();
                }

                case 'webview_is_ready': {
                    return true;
                }
                case 'init_service': {
                    break;
                }
                case 'stop_service': {
                    break;
                }
                case 'check_state': {
                    return this.getState();
                }
                case 'check_service': {
                    break;
                }
                case 'run_action': {
                    const { payloadEvent, pythonPath } = payload;
                    console.log({ payloadEvent });
                    if (!pythonPath || !payloadEvent) {
                        return;
                    }
                    const { eventType, keyEvent, x, y } = payloadEvent;
                    const action = new Action(pythonPath);
                    switch (eventType) {
                        case 'click': {
                            action.process({
                                eventType: 'click',
                                x,
                                y
                            });
                            return;
                        }
                        case 'rightClick': {
                            action.process({
                                eventType: 'rightClick',
                                x,
                                y
                            });
                            return;
                        }

                        case 'keyDown': {
                            action.process({
                                eventType: 'keyDown',
                                keyEvent
                            });
                            return;
                        }
                    }
                    break;
                }

                case 'open_ctl_server': {
                    return open_ctl_server();
                }

                case 'get_display_bounds': {
                    let { display_id } = payload;
                    const displays = screen.getAllDisplays();
                    const display = displays.find(d => d.id === parseInt(display_id, 10));
                    console.log(display);
                    if (display && display.bounds) {
                        return display.bounds;
                    } else {
                        return null;
                    }
                }
            }
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = undefined;
            ipcMain.removeHandler('message');
        });

        await delay(500);
        return this.mainWindow;
    }

    static async bringToFront() {
        if (process.platform === 'win32') {
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) this.mainWindow.restore();
            } else {
                // Open main windows
                await this.openMainWindow();
            }

            this.mainWindow.setAlwaysOnTop(true);
            this.mainWindow.focus();
            this.mainWindow.setAlwaysOnTop(false);
        } else {
            await this.openMainWindow();
            this.mainWindow.show();
        }

        return this.mainWindow;
    }
}

function open_ctl_server(): any {
    let file = path.resolve(publicDir, !isWin ? 'web3-ctl-server' : 'web3-ctl-server.exe');
    try {
        let process;
        if (isWin) {
            process = spawn(file, [], { detached: true, stdio: "ignore" });
        } else {
            // if (isMac && isDev) {
            //     // Use `open -a Terminal` to open a new Terminal window and execute the command
            //     exec(`sh /Users/ton/Desktop/projects/web3-desk/apps/py-bot/start.sh`, error => {
            //         if (error) {
            //             console.error(`Failed to start the Web3 Control Server: ${error.message}`);
            //         }
            //     });
            // }else{
            //     process = spawn(file, [], { detached: true, stdio: "ignore" });

            // }
            process = spawn(file, [], { detached: true, stdio: "ignore" });

        }
        if(process){
            process.unref(); // 让进程独立运行，不受 Electron 退出影响
        }
        console.log(`Web3 Control Server started: ${file}`);
        return true;
    } catch (error) {
        console.error(`Failed to start the Web3 Control Server: ${error.message}`);
        return false;
    }
}
