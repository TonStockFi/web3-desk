import * as crypto from 'crypto';
// @ts-ignore
import bs58 from 'bs58';
// @ts-ignore
import bs58check from 'bs58check';

function calculateChecksum(buffer: Buffer): Buffer {
    const hash1 = crypto.createHash('sha256').update(buffer).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    console.log(hash2);
    return hash2.slice(0, 4);
}

export function hexToBs58(
    hexString: string,
    compressed: boolean = true
): string {
    console.log({ hexString });
    if (hexString.indexOf('0x') === 0) {
        hexString = hexString.substring(2);
    }
    // Ensure the hex string is 64 characters (32 bytes) long
    if (hexString.length !== 64) {
        throw new Error('Invalid private key length');
    }

    // Add version byte for mainnet (0x80)
    const versionByte = '80';
    // const end = '01a2707dbf';
    let extendedKey = versionByte + hexString;
    if (compressed) {
        extendedKey += '01';
    }
    // Convert hex to buffer
    const buffer = Buffer.from(extendedKey, 'hex');
    console.log(buffer);
    // Calculate checksum (first 4 bytes of double SHA256)
    const checksum = calculateChecksum(buffer);
    console.log({ checksum });
    // Concatenate key and checksum
    const keyWithChecksum = Buffer.concat([buffer, checksum]);

    // Encode with Base58
    return bs58.encode(keyWithChecksum);
}

export function base58ToHex(base58String: string): string {
    // Decode the Base58 string to a buffer
    const buffer = bs58.decode(base58String);
    console.log(Buffer.from(buffer));
    // Convert the buffer to a hexadecimal string
    const hexString = Buffer.from(buffer).toString('hex');
    // Remove the version byte (first byte) and checksum (last 4 bytes)
    return hexString.slice(2, -10);
}

// function toBase58Check1(hash: string, version: number) {
//   var payload;
//   return version < 256
//     ? (typeforce(types.tuple(types.Hash160bit, types.UInt8), arguments),
//       (payload = Buffer.allocUnsafe(21)).writeUInt8(version, 0),
//       hash.copy(payload, 1),
//       bs58check.encode(payload))
//     : (typeforce(types.tuple(types.Hash160bit, types.UInt16), arguments),
//       (payload = Buffer.allocUnsafe(22)).writeUInt16BE(version, 0),
//       hash.copy(payload, 2),
//       bs58check.encode(payload));
// }

export function toBase58Check(hash: Buffer, version: number): string {
    if (!(hash instanceof Buffer) || hash.length !== 20) {
        throw new Error('Invalid hash: must be a Buffer of 20 bytes');
    }

    if (!Number.isInteger(version) || version < 0) {
        throw new Error('Invalid version: must be a non-negative integer');
    }

    let payload: Buffer;

    if (version < 256) {
        payload = Buffer.allocUnsafe(21);
        payload.writeUInt8(version, 0);
        hash.copy(payload, 1);
    } else if (version <= 65535) {
        payload = Buffer.allocUnsafe(22);
        payload.writeUInt16BE(version, 0);
        hash.copy(payload, 2);
    } else {
        throw new Error('Version number too large: must be <= 65535');
    }

    return bs58check.encode(payload);
}

export function publicKeyToAddress(
    pubKey: string,
    version: number = 0x00
): string {
    if (pubKey.indexOf('0x') === 0) {
        pubKey = pubKey.substring(2);
    }
    // Convert the public key from hex to a buffer
    const pubKeyBuffer = Buffer.from(pubKey, 'hex');

    // Perform SHA-256 hashing on the public key
    const sha256Hash = crypto.createHash('sha256').update(pubKeyBuffer).digest();

    // Perform RIPEMD-160 hashing on the SHA-256 result
    const ripemd160Hash = crypto
        .createHash('ripemd160')
        .update(sha256Hash)
        .digest();

    // Add version byte (version for mainnet)
    const versionByte = Buffer.from([version]);
    const versionedPayload = Buffer.concat([versionByte, ripemd160Hash]);

    // Compute the checksum (first 4 bytes of double SHA-256)
    const checksum = calculateChecksum(versionedPayload);

    // Append the checksum to the versioned payload
    const fullPayload = Buffer.concat([versionedPayload, checksum]);

    // Encode to Base58Check
    return bs58.encode(fullPayload);
}
