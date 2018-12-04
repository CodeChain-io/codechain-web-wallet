import * as CryptoJS from "crypto-js";
import { AddressType } from "../model/address";

const localstorageKeyOfPlatform = "platformKeys";
const localstorageKeyOfAsset = "assetKeys";
const passphraseKey = "authKey";
export interface StoredKey {
    pathIndex: number;
    type: AddressType;
    key: string;
}

export function getPlatformKeys(): StoredKey[] | null {
    const platformKeysString = localStorage.getItem(localstorageKeyOfPlatform);
    if (platformKeysString) {
        try {
            return JSON.parse(platformKeysString);
        } catch (e) {
            console.log(e);
        }
    }
    return null;
}

export function getAssetKeys(): StoredKey[] | null {
    const assetKeysString = localStorage.getItem(localstorageKeyOfAsset);
    if (assetKeysString) {
        try {
            return JSON.parse(assetKeysString);
        } catch (e) {
            console.log(e);
        }
    }
    return null;
}

export function clearWalletKeys() {
    localStorage.removeItem(localstorageKeyOfAsset);
    localStorage.removeItem(localstorageKeyOfPlatform);
}

export function clearPassphrase() {
    sessionStorage.removeItem(passphraseKey);
}

export function savePlatformKeys(platformKeys: StoredKey[]) {
    localStorage.setItem(
        localstorageKeyOfPlatform,
        JSON.stringify(platformKeys)
    );
}

export function saveAssetKeys(assetKeys: StoredKey[]) {
    localStorage.setItem(localstorageKeyOfAsset, JSON.stringify(assetKeys));
}

const cryptoKey = "secret key";
export function savePassphrase(passphrase: string) {
    const encryptedKey = CryptoJS.AES.encrypt(passphrase, cryptoKey).toString();
    sessionStorage.setItem(passphraseKey, encryptedKey);
}

export function getPassphrase() {
    const encryptedKey = sessionStorage.getItem(passphraseKey);
    if (encryptedKey) {
        return CryptoJS.AES.decrypt(encryptedKey, cryptoKey).toString();
    }
    return null;
}
