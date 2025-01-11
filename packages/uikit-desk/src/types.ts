
export type VoidFun = Promise<void> | void;

export enum MAIN_NAV_TYPE {
    FAVOR = 'FAVOR',
    MARKET = 'tab_Market',
    ACCOUNTS_MANAGE = 'ACCOUNTS_MANAGE',
    MOBILE_MONITORS = 'MOBILE_MONITORS',
    DISCOVERY = 'tab_DISCOVERY',
    BROWSER_HISTORY = 'BROWSER_HISTORY',
    CONNECTED_APPS = 'CONNECTED_APPS',
    MULTI_SEND = 'MULTI_SEND',
    DASHBOARD = 'tab_DASHBOARD',
    ASSETS = 'tab_ASSETS',
    SETTING = 'SETTING',
    GAME_FI = 'tab_GAME_FI',
    CHATGPT = 'tab_CHATGPT',
    GENIMI = 'tab_GEMINI',
    WALLET = 'WALLET',
    DEV = 'DEV',
    SWAP = 'SWAP',
    NULL = 'NULL'
}

export interface SiteInfo {
    partitionId: string;
    deviceId: string;
    url: string;
    order: number;
}

export interface AppOptions {
    IS_DEV?: boolean;
    options: {
        mainNavType?: MAIN_NAV_TYPE;
        setMainNavType: (v: MAIN_NAV_TYPE) => void;
        windowSize?: {
            width: number;
            height: number;
        };
    };
}

export interface ContextMenuProps {
    webContentsId: number;
    params: {
        x: number;
        y: number;
        selectionText: string;
        selectionRect: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
}
export type WebveiwEventType =
    | 'console-message'
    | 'new-window'
    | 'context-menu'
    | 'found-in-page'
    | 'did-start-navigation'
    | 'load-commit'
    | 'did-start-loading'
    | 'did-stop-loading'
    | 'will-navigate'
    | 'did-frame-finish-load'
    | 'did-fail-load'
    | 'did-finish-load'
    | 'dom-ready'
    | 'page-title-updated'
    | 'page-favicon-updated'
    | 'enter-html-full-screen'
    | 'leave-html-full-screen'
    | 'close'
    | 'destroyed';

    

export interface GameDetail {
    id: string;
    icon: string;
    name: string;
    url: string;
    iframeBaseUrl: string;
    description: string;
    iframeUrl?: string;
}
export interface GameProps {
    detail: GameDetail;
    ts?: number;
    ts1?: number;
    account: {
        id: string;
        address: string;
        name: string;
        emoji: string;
        index: number;
    };
}
export interface BoundingClientRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export enum SUB_WIN_ID {
    DEVICES = 'DEVICES',
    ASSETS = 'ASSETS',
    PLAYGROUND = 'PLAYGROUND',
    OCR = 'OCR',
    LLM = 'LLM',
    OPENCV = 'OPENCV',
    MAIN = 'MAIN'
}

export interface AccountPublic {
    isMam?: boolean;
    isActive?: boolean;
    isHide?: boolean;
    address: string;
    name: string;
    index: number;
    emoji: string;
    id: string;
}

export interface CustomDeviceWsServerHosts {
    host: string;
}

export enum GLOBAL_ACTIONS {
    GLOBAL_ACTION_BACK = 1,
    GLOBAL_ACTION_HOME = 2,
    GLOBAL_ACTION_RECENTS = 3,
    GLOBAL_ACTION_NOTIFICATIONS = 4,
    GLOBAL_ACTION_QUICK_SETTINGS = 5,
    GLOBAL_ACTION_POWER_DIALOG = 6,
    GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN = 7,
    GLOBAL_ACTION_LOCK_SCREEN = 8,
    GLOBAL_ACTION_KEYCODE_HEADSETHOOK = 10,
    GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS = 14,
    GLOBAL_ACTION_DPAD_CENTER = 20
}

export const GLOBAL_ACTIONS_MAP = {
    1: 'GLOBAL_ACTION_BACK',
    2: 'GLOBAL_ACTION_HOME',
    3: 'GLOBAL_ACTION_RECENTS',
    4: 'GLOBAL_ACTION_NOTIFICATIONS',
    5: 'GLOBAL_ACTION_QUICK_SETTINGS',
    6: 'GLOBAL_ACTION_POWER_DIALOG',
    7: 'GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN',
    8: 'GLOBAL_ACTION_LOCK_SCREEN',
    10: 'GLOBAL_ACTION_KEYCODE_HEADSETHOOK',
    14: 'GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS',
    20: 'GLOBAL_ACTION_DPAD_CENTER'
};

export interface DeviceInfo {
    deviceId: string;
    platform:string;
    arch:string;
    password?: string;
    passwordHash?: string;
    serverApi?: string;
    inputIsOpen?: boolean;
    mediaIsStart?: boolean;
    compressQuality?: number;
    delayPullEventMs?: number;
    delaySendImageDataMs?: number;
    screen?: {
        height: number;
        width: number;
        scale: number;
        dpi: number;
    };
}

export enum SWIPER_KIND {
    SWIPER_KIND_UP_DOWN = 10,
    SWIPER_KIND_UP_DOWN_SLOW = 11,
    SWIPER_KIND_LEFT_RIGHT = 20,
    SWIPER_KIND_LEFT_RIGHT_SLOW = 21
}

export enum WsCloseCode {
    //@delete
    CLOSE_AND_DESTROY = 1001,
    //@delete
    CLOSE_AND_RECONNECT = 1002,

    WS_CLOSE_STOP_RECONNECT = 3001,
    WS_CLOSE_RECONNECT = 3002
}

export enum ErrCodes {
    CONNECT_ERROR = 'CONNECT_ERROR',
    DEVICE_NOT_EXISTS = 'DEVICE_NOT_EXISTS',
    PASSWORD_NOT_VALID = 'PASSWORD_NOT_VALID',
    SCREEN_IMAGE_NOT_EXISTS = 'SCREEN_IMAGE_NOT_EXISTS',
    SCREEN_IMAGE_NOT_UPDATE = 'SCREEN_IMAGE_NOT_UPDATE',
    EVENT_NOT_UPDATE = 'EVENT_NOT_UPDATE'
}

export type sendMessageParams = {
    eventType:
        | 'action'
        | 'click'
        | 'swiper'
        | 'dragStart'
        | 'dragMove'
        | 'dragEnd'
        | 'delayPullEventMs'
        | 'delaySendImageDataMs'
        | string;
    x?: number;
    y?: number;
    value?: GLOBAL_ACTIONS | SWIPER_KIND | number;
    delta?: number;
    text?: string;
};

export type ScreenInfo = {
    width: number;
    height: number;
    dpi: number;
    scale: number;
};

export type ViewSize = {
    width: number;
    height: number;
};
export interface CutAreaRect {
    start: { x: number; y: number };
    end: { x: number; y: number };
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface RecAreaRect {
    start: { x: number; y: number };
    end: { x: number; y: number };
    maxVal: number;
}

export interface XYWHProps {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ExtenssionPublishDataRow {
    img?: string;
    row: RoiInfo;
    plainData?: {
        id: string;
        name: string;
    };
    encryptData?: string;
}

export interface ExtenssionPublishData {
    extensionId: string;
    host: string;
    mainId: string;
    createTs: number;
    version: string;
    ids: string[];
    desc: string;
    amount: number;
    payAddress: string;

    rows: ExtenssionPublishDataRow[];
}

export interface BrowserExtensionInfo {
    id: string;
    ts: number;
    name: string;
    jsCode: string;
    desc: string;
    isEnable?:boolean
}
export interface RoiInfo {
    id: string;
    tabId: string;
    pid: string;
    threshold: number;
    cutAreaRect: XYWHProps;
    ts: number;
    name?: string;
    priority: number;
    jsCode?: string;
    type?: 'task' | 'reco' | string;
    action?: 'click' | 'invokeCode' | 'cron' | string;
    icon?: string;
    extensionId?: string;
    extensionTs?: number;
    creator?: string;
    desc?: string;
}

export interface CutItemProps {
    roiXYWH: XYWHProps;
    matchThreshold: number;
    compressQuality: number;
    monitorScale: number;
    id: string;
    deviceId: string;
    ts: number;
    name: string;
    screen: ScreenInfo;
}
export type PRO_LEVEL = 'MONTH' | 'YEAR' | 'LONG';

export interface ProPlan {
    level: PRO_LEVEL;
    name: string;
    description?: string;
    /**
     * nanoton
     */
    amount: string;
}

export interface ProInfoProps {
    id: string;
    index: number;
    level: PRO_LEVEL;
    amount: number;
    ts: number;
}

export interface CurrentPayPlan {
    isLongProLevel: boolean;
    isPayMmeber: boolean;
    plans: ProInfoProps[];
    plan: ProInfoProps;
}

export interface AssetBalanceProps {
    amount: number;
    name: string;
    symbol: string;
    image: string;
}

export interface AccountAssetBalance {
    id: string;
    index: number;
    balance: string;
    assetList: AssetBalanceProps[];
}

export interface PayCommentOrder {
    id: string;
    isOk?: boolean;
    winId?: string;
    symbol: string;
    amount: string;
    checkProLevel?: boolean;
    address: string;
    ts: number;
    comment: string;
    ts1?: number;
}

export interface SendTransferPayload {
    address: string;
    amount: number;
    winId?: string;
    comment?: string;
    mainNet?: boolean;
    jetton?: string;
    needPayOrder?: boolean;
}

export interface WebApp {
    name: string;
    description: string;
    icon: string;
    url: string;
    id?: string;
    isDev?: boolean;
    iframeBaseUrl?: string;
    twa?: boolean;
    mobile?: boolean;
}
export interface TonHistoryItem {
    kind: 'ton' | string;
    jetton: {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        image: string;
    };
    timestamp: number;
    amount: number;
    isTon: boolean;
    status: 'ok';
    comment?: string;
    fromAddress: string;
    toAddress: string;
}

export interface WebAppListItem {
    id: string;
    hide?: boolean;
    title: string;
    children: WebAppListItem[];
    apps?: WebApp[];
}

export enum Network {
    MAINNET = -239,
    TESTNET = -3
}

export interface MainNavListItem {
    name: string;
    tabId: MAIN_NAV_TYPE | string;
    icon?: string;
    hide?: boolean;
    side?: boolean;
    url?: string;
}

export interface InitConfig {
    leftSideActions: MainNavListItem[];
    proPlans: ProPlan[];
    proRecvAddress: string;
}

export enum PlaygroundMasterSideAction {
    FEATURE = 'FEATURE',
    TASK = 'TASK',
    EXTENSION = 'EXTENSION',
    WIN_COPY = 'WIN_COPY'
}

export enum WinControlType {
    ALL = 'ALL',
    CURRENT = 'CURRENT',
    POSITION = 'POSITION',
    CURRENT_APP = 'CURRENT_APP',
    CURRENT_ACCOUNT = 'CURRENT_ACCOUNT'
}

export enum CHAIN {
    TON = 'TON',
    ETH = 'ETH',
    BNB = 'BNB',
    SOL = 'SOL',
    SUI = 'SUI',
    BTC = 'BTC'
}

export interface ChainListItem {
    chain: CHAIN;
    name: string;
    icon: string;
}

export interface MainMessageEvent {
    action: string;
    webContentsId?: Number;
    fromWinId?: string;
    payload?: Record<string, any>;
    __msg_id?: number;
}

export interface TMAGlobalInfo {
    userId?: string;
    botId?: string;
    invite_code?: string;
    reward_points?: number;
    reward_w3c?: number;
    daily_check_in?: number;
}
export enum TmaPageNav {
    HOME = 'Home',
    AIRDROP = 'Airdrop',
    W3C_TOKEN = 'W3C-Token'
}
export enum WebpageNav {
    HOME = 'HOME',
    JOIN_US = 'JOIN_US',
    TOKEN = 'TOKEN',
    MALL = 'MALL',
    DAO = 'DAO',
    WEB3_EXPLORER = 'WEB3_EXPLORER',
    WEB3_DESK = 'WEB3_DESK',
    DISCOVER = 'DISCOVER',
    GAMES_FI = 'GAMES_FI',
    SWAP = 'SWAP',
    TASK = 'TASK'
}

export interface HodlerRow {
    address: string;
    balance: number;
    tag?: string;
    pie: string;
}

export interface JobItem {
    title: string;
    salary: string;
    desc: Record<string, string>;
}

export interface ProposalItem {
    title: string;
    detail: Record<string, string>;
    creator: string;
}

export interface MallProduct {
    title: string;
    pirce: string;
    pirceReal: string;
    desc: string;
    detail: string;
}
