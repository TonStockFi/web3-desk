// @ts-ignore
import * as CryptoJS from 'crypto-js';

export function md5(message: string) {
  const salt = message.length > 2 ? message.substring(2) : 'salt';
  return CryptoJS.MD5('md5:' + salt + '/' + message).toString();
}


export function stringToHex(str: string): string {
  return str
    .split('')
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

export function padKeyTo8Bytes(key: string): string {
  return key.length >= 8
    ? key.substring(0, 8) // Truncate if the key is longer than 8 characters
    : key.padEnd(8, '0'); // Pad with '0' if the key is shorter than 8 characters
}


const arrayBufferToBase64 = (buffer: Iterable<number> | ArrayBuffer) => {
  let binary = '';
  // @ts-ignore
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
