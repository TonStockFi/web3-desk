import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import { WS_URL } from '../constant';

export default class ServerApi {
    static url(path: string): any {
        return `${ServerApi.getServerApi()}/${path}`;
    }

    static getServerApi(): any {
        return WS_URL;
    }

    static setServerApi(api: string): any {
        localStorage.setItem('client-serverApi', api);
    }

    static getPassword(hash?: boolean): any {
        const password = localStorage.getItem('client-password') || '';
        if (hash && password) {
            return md5(password);
        }
        return password;
    }

    static getDeviceId() {
        return localStorage.getItem('client-deviceId') || '';
    }
}
