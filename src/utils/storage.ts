import CryptoJS from "crypto-js";
import _ from "lodash";
import { AddressType, NetworkId } from "../model/address";

const localstorageKeyOfPlatform = "platformKeys";
const localstorageKeyOfAsset = "assetKeys";
const networkIdKey = "netowrkId";
const passphraseKey = "authKey";
export interface StoredKey {
    pathIndex: number;
    type: AddressType;
    key: string;
}

function getStorageKeyOfPlatform(networkId: NetworkId) {
    return `${localstorageKeyOfPlatform}_${networkId}`;
}

function getStorageKeyOfAsset(networkId: NetworkId) {
    return `${localstorageKeyOfAsset}_${networkId}`;
}

export function getPlatformKeys(networkId: NetworkId): StoredKey[] | null {
    const platformKeysString = localStorage.getItem(
        getStorageKeyOfPlatform(networkId)
    );
    if (platformKeysString) {
        try {
            return JSON.parse(platformKeysString);
        } catch (e) {
            console.log(e);
        }
    }
    return null;
}

export function getAssetKeys(networkId: NetworkId): StoredKey[] | null {
    const assetKeysString = localStorage.getItem(
        getStorageKeyOfAsset(networkId)
    );
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
    _.each(["cc", "tc", "wc", "sc"], network => {
        localStorage.removeItem(getStorageKeyOfAsset(network as NetworkId));
        localStorage.removeItem(getStorageKeyOfPlatform(network as NetworkId));
    });
}

export function clearPassphrase() {
    sessionStorage.removeItem(passphraseKey);
}

export function saveNetworkId(netowrkId: NetworkId) {
    sessionStorage.setItem(networkIdKey, netowrkId);
}

export function getNetworkId(): NetworkId {
    return sessionStorage.getItem(networkIdKey) as NetworkId;
}

export function savePlatformKeys(
    platformKeys: StoredKey[],
    networkId: NetworkId
) {
    localStorage.setItem(
        getStorageKeyOfPlatform(networkId),
        JSON.stringify(platformKeys)
    );
}

export function saveAssetKeys(assetKeys: StoredKey[], netowrkId: NetworkId) {
    localStorage.setItem(
        getStorageKeyOfAsset(netowrkId),
        JSON.stringify(assetKeys)
    );
}

const cryptoKey = "secret key";
export function savePassphrase(passphrase: string) {
    const encryptedKey = CryptoJS.AES.encrypt(passphrase, cryptoKey).toString();
    sessionStorage.setItem(passphraseKey, encryptedKey);
}

export function getPassphrase() {
    const encryptedKey = sessionStorage.getItem(passphraseKey);
    if (encryptedKey) {
        return CryptoJS.AES.decrypt(encryptedKey, cryptoKey).toString(
            CryptoJS.enc.Utf8
        );
    }
    return null;
}
