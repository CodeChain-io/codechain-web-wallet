import { CCKey } from "codechain-keystore";
import {
    AssetTransferAddress,
    PlatformAddress
} from "codechain-sdk/lib/core/classes";
import { blake160 } from "codechain-sdk/lib/utils";
import _ from "lodash";
import { getAggsUTXOList, getPlatformAccount } from "../networks/Api";
import {
    getAssetKeys,
    getPlatformKeys,
    saveAssetKeys,
    savePlatformKeys,
    StoredKey
} from "../utils/storage";
import { AddressType, NetworkId, WalletAddress } from "./address";

let dbType = "persistent";
if (process.env.CI) {
    dbType = "in-memory";
}

let globalCCKey: CCKey;
export async function getCCKey() {
    if (!globalCCKey) {
        globalCCKey = await CCKey.create({ dbType });
    }
    return globalCCKey;
}

export async function clearKeystore() {
    const ccKey = await getCCKey();
    await ccKey.clear();
}

export async function createSeed(passphrase: string) {
    const ccKey = await getCCKey();
    return await ccKey.hdwseed.createSeed({ passphrase, seedLength: 128 });
}

export async function getFirstSeedHash() {
    const ccKey = await getCCKey();
    const seedHashes = await ccKey.hdwseed.getSeedHashes();
    return seedHashes[0];
}

export async function exportMnemonic(passphrase: string) {
    const ccKey = await getCCKey();
    const seedHash = await getFirstSeedHash();
    const mnemonic = await ccKey.hdwseed.exportMnemonic({
        seedHash,
        passphrase
    });
    return mnemonic;
}

export async function importMnemonic(mnemonic: string, passphrase: string) {
    const ccKey = await getCCKey();
    await ccKey.hdwseed.importMnemonic({ mnemonic, passphrase });
}

export async function isKeystoreExisted() {
    return CCKey.exist({ dbType });
}

// m / purpose' / coin_type' / account' / change / address_index
const platformAddressPath = "m/44'/3276/0'/0/";
const assetAddressPath = "m/44'/3276/1'/0/";
const restoringCheckingRange = 10;

export function getPlatformAddressPath(index: number) {
    return platformAddressPath + index;
}

export function getAssetAddressPath(index: number) {
    return assetAddressPath + index;
}

export async function restorePlatformAddresses(
    passphrase: string,
    networkId: NetworkId
): Promise<WalletAddress[]> {
    const ccKey = await getCCKey();
    const seedHash = await getFirstSeedHash();
    let currentPath = 0;
    const platformAddresses: WalletAddress[] = [];
    const platformKeys: StoredKey[] = [];
    let lastValidPlatfromPathIndex: number | undefined | null;
    while (currentPath < restoringCheckingRange) {
        const platformPubkey = await ccKey.hdwseed.getPublicKeyFromSeed({
            seedHash,
            path: platformAddressPath + currentPath,
            passphrase
        });
        const key = blake160(platformPubkey);
        const address = PlatformAddress.fromAccountId(key, {
            networkId
        }).value;
        const account = await getPlatformAccount(address, networkId);
        if (!account.seq.eq(0) || !account.balance.eq(0)) {
            lastValidPlatfromPathIndex = currentPath;
        }
        platformAddresses.push({
            index: currentPath,
            address,
            type: AddressType.Platform
        });
        platformKeys.push({
            pathIndex: currentPath,
            type: AddressType.Platform,
            key
        });
        currentPath += 1;
    }
    let retValue: WalletAddress[];
    let retKeys: StoredKey[];
    if (lastValidPlatfromPathIndex == null) {
        retValue = platformAddresses.slice(0, 1);
        retKeys = platformKeys.slice(0, 1);
    } else {
        retValue = platformAddresses.slice(0, lastValidPlatfromPathIndex + 1);
        retKeys = platformKeys.slice(0, lastValidPlatfromPathIndex + 1);
    }
    savePlatformKeys(retKeys, networkId);
    return retValue;
}

export async function createPlatformAddress(
    passphrase: string,
    networkId: NetworkId
) {
    const ccKey = await getCCKey();
    const seedHash = await getFirstSeedHash();
    const savedPlatformKeys = getPlatformKeys(networkId);
    let newPathIndex;
    if (savedPlatformKeys && savedPlatformKeys.length > 0) {
        newPathIndex = _.last(savedPlatformKeys)!.pathIndex + 1;
    } else {
        newPathIndex = 0;
    }
    const platformPubkey = await ccKey.hdwseed.getPublicKeyFromSeed({
        seedHash,
        path: platformAddressPath + newPathIndex,
        passphrase
    });
    const key = blake160(platformPubkey);
    if (savedPlatformKeys && savedPlatformKeys.length > 0) {
        savePlatformKeys(
            [
                ...savedPlatformKeys,
                {
                    pathIndex: newPathIndex,
                    type: AddressType.Platform,
                    key
                }
            ],
            networkId
        );
    } else {
        savePlatformKeys(
            [
                {
                    pathIndex: newPathIndex,
                    type: AddressType.Platform,
                    key
                }
            ],
            networkId
        );
    }
    const address = PlatformAddress.fromAccountId(key, {
        networkId
    }).value;
    return {
        index: newPathIndex,
        address,
        type: AddressType.Platform
    };
}

export async function createAssetAddress(
    passphrase: string,
    networkId: NetworkId
) {
    const ccKey = await getCCKey();
    const seedHash = await getFirstSeedHash();
    const savedAssetKeys = getAssetKeys(networkId);
    let newPathIndex;
    if (savedAssetKeys && savedAssetKeys.length > 0) {
        newPathIndex = _.last(savedAssetKeys)!.pathIndex + 1;
    } else {
        newPathIndex = 0;
    }
    const assetPubKey = await ccKey.hdwseed.getPublicKeyFromSeed({
        seedHash,
        path: assetAddressPath + newPathIndex,
        passphrase
    });
    const key = blake160(assetPubKey);
    if (savedAssetKeys && savedAssetKeys.length > 0) {
        saveAssetKeys(
            [
                ...savedAssetKeys,
                {
                    pathIndex: newPathIndex,
                    type: AddressType.Platform,
                    key
                }
            ],
            networkId
        );
    } else {
        saveAssetKeys(
            [
                {
                    pathIndex: newPathIndex,
                    type: AddressType.Platform,
                    key
                }
            ],
            networkId
        );
    }
    const address = AssetTransferAddress.fromTypeAndPayload(1, key, {
        networkId
    }).value;
    return {
        index: newPathIndex,
        address,
        type: AddressType.Asset
    };
}

export async function checkPassphrase(passphrase: string) {
    const ccKey = await getCCKey();
    const seedHashes = await ccKey.hdwseed.getSeedHashes();
    const seedHash = seedHashes[0];
    try {
        await ccKey.hdwseed.exportMnemonic({ seedHash, passphrase });
        return true;
    } catch (e) {
        console.log(e);
    }
    return false;
}

export async function restoreAssetAddresses(
    passphrase: string,
    networkId: NetworkId
): Promise<WalletAddress[]> {
    const ccKey = await getCCKey();
    const seedHash = await getFirstSeedHash();
    let currentPath = 0;
    const assetAddresses: WalletAddress[] = [];
    const assetKeys: StoredKey[] = [];
    let lastValidAssetPathIndex: number | undefined | null;
    while (currentPath < restoringCheckingRange) {
        const assetPubKey = await ccKey.hdwseed.getPublicKeyFromSeed({
            seedHash,
            path: assetAddressPath + currentPath,
            passphrase
        });
        const key = blake160(assetPubKey);
        const address = AssetTransferAddress.fromTypeAndPayload(1, key, {
            networkId
        }).value;
        const aggsUTXO = await getAggsUTXOList(address, networkId);
        if (aggsUTXO.length !== 0) {
            lastValidAssetPathIndex = currentPath;
        }
        assetAddresses.push({
            index: currentPath,
            address,
            type: AddressType.Asset
        });
        assetKeys.push({
            type: AddressType.Asset,
            pathIndex: currentPath,
            key
        });
        currentPath += 1;
    }

    let retValue: WalletAddress[];
    let retKeys: StoredKey[];
    if (lastValidAssetPathIndex == null) {
        retValue = assetAddresses.slice(0, 1);
        retKeys = assetKeys.slice(0, 1);
    } else {
        retValue = assetAddresses.slice(0, lastValidAssetPathIndex + 1);
        retKeys = assetKeys.slice(0, lastValidAssetPathIndex + 1);
    }
    saveAssetKeys(retKeys, networkId);
    return retValue;
}
