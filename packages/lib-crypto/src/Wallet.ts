//@ts-ignore
import { hdkey as HDKey } from 'ethereumjs-wallet';

import Mnemonic, { MnemonicLangEnum } from './Mnemonic';
import { hexToBs58, publicKeyToAddress, toBase58Check } from './Address';

export const TRON_HD_PATH = "m/44'/195'/0'";
export const BTC_HD_PATH = "m/44'/0'/0'";
export const ETH_HD_PATH = "m/44'/60'/0'";
export const PTP_HD_PATH = "m/44'/60'/1'";
export const PTP_GROUP_HD_PATH = "m/44'/60'/1'";

export enum EncryptType {
  EncryptType_Wallet,
  EncryptType_Group,
}

export default class Wallet {
  private __masterKey: any | undefined;

  constructor(mnemonic: Mnemonic, password?: string | undefined) {
    const seed = mnemonic.toSeedBuffer(password);
    this.__masterKey = HDKey.fromMasterSeed(seed);
    Object.defineProperty(this, '__masterKey', {
      value: HDKey.fromMasterSeed(seed),
      writable: false,
    });
  }

  getMashKey() {
    return this.__masterKey!;
  }
  getBIP32RootKey(): string {
    if (!this.__masterKey) {
      throw new Error('Master key is not initialized');
    }

    // Serialize the master key to get the extended private key (xprv)
    return this.__masterKey.privateExtendedKey();
  }

  static fromEntropy(
    entropy: string,
    password: string | undefined,
    lang: MnemonicLangEnum | undefined
  ) {
    const mnemonic = Mnemonic.fromEntropy(entropy, lang);
    return new Wallet(mnemonic, password);
  }

  getChild(
    root: string,
    childIndex = 0,
    changeIndex: number = 0,
    hex: boolean = false
  ) {
    const path = `${root}/${changeIndex}/${childIndex}`;
    const childKey = this.getMashKey().derivePath(path);

    let prvKey = childKey._hdkey.privateKey;
    const pubKey = childKey._hdkey.publicKey;
    const pubKey_ = childKey.getWallet().getPublicKey();
    //console.log({ pubKey_ }, pubKey_.toString('hex'));
    let address;
    let prvKeyBs58;
    if (path.indexOf(BTC_HD_PATH) === 0) {
      address = publicKeyToAddress(pubKey);
      prvKeyBs58 = hexToBs58(Wallet.bufferToHex(prvKey));
    } else if (path.indexOf(TRON_HD_PATH) === 0) {
      //ea76f48f28186ca38f979f1209fcbb57b5cefeb2
      console.log(
        'ea76f48f28186ca38f979f1209fcbb57b5cefeb2',
        childKey.getWallet().getAddressString().substring(2)
      );
      const addressBuffer = Buffer.from(
        childKey.getWallet().getAddressString().substring(2),
        'hex'
      );
      address = toBase58Check(addressBuffer, 0x41);
      console.log({ address });
    } else {
      address = childKey.getWallet().getAddressString();
    }

    if (hex) {
      return {
        path,
        address,
        prvKeyBs58,
        prvKey: Wallet.bufferToHex(prvKey),
        pubKey: Wallet.bufferToHex(pubKey),
        pubKey_: Wallet.bufferToHex(pubKey_),
      };
    } else {
      return {
        path,
        address,
        prvKey,
        pubKey,
        pubKey_,
      };
    }
  }

  static bufferToHex(buffer: Buffer) {
    return '0x' + buffer.toString('hex');
  }

  // Add the new getTronWallet function
  getTronWallet(childIndex: number, hex?: boolean) {
    return this.getChild(TRON_HD_PATH, childIndex, 0, !!hex);
  }

  // Add the new getBtcWallet function
  getBtcWallet(childIndex: number, hex?: boolean) {
    return this.getChild(BTC_HD_PATH, childIndex, 0, !!hex);
  }

  getEthWallet(childIndex: number, hex?: boolean) {
    return this.getChild(ETH_HD_PATH, childIndex, 0, !!hex);
  }

  getPTPWallet(childIndex: number, hex?: boolean) {
    return this.getChild(
      PTP_HD_PATH,
      childIndex,
      EncryptType.EncryptType_Wallet,
      !!hex
    );
  }

  getPTPEncryptWallet(childIndex: number, type: EncryptType) {
    return this.getChild(PTP_HD_PATH, childIndex, type, false);
  }

  getGroupWallet(childIndex: number, hex?: boolean) {
    return this.getChild(
      PTP_GROUP_HD_PATH,
      childIndex,
      EncryptType.EncryptType_Group,
      !!hex
    );
  }
}
