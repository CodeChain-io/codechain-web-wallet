import { CCKey } from "codechain-keystore";
import {
    AssetTransferAddress,
    PlatformAddress
} from "codechain-sdk/lib/core/classes";
import * as FileSaver from "file-saver";
import * as _ from "lodash";
import { __await } from "tslib";
import { AddressType, NetworkId, WalletAddress } from "./address";

let dbType = "volatile";
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

export async function exportKeystore(name: string) {
    const ccKey = await getCCKey();
    const text = await ccKey.save();
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    FileSaver.saveAs(blob, `${name}.wallet`);
}

export async function setWalletName(name: string) {
    const ccKey = await getCCKey();
    const meta = await ccKey.getMeta();
    let newMeta;
    try {
        const parsedMeta = JSON.parse(meta);
        newMeta = Object.assign(parsedMeta, { name });
    } catch (e) {
        newMeta = { name };
    }
    await ccKey.setMeta(JSON.stringify(newMeta));
}

export async function removePlatformAddress(address: string) {
    const ccKey = await getCCKey();
    const key = PlatformAddress.fromString(address).accountId.value;
    await ccKey.platform.deleteKey({ key });
}

export async function removeAssetAddress(address: string) {
    const ccKey = await getCCKey();
    const key = AssetTransferAddress.fromString(address).payload.value;
    await ccKey.asset.deleteKey({ key });
}

export async function createAddress(
    type: AddressType,
    name: string,
    passphrase: string
) {
    const ccKey = await getCCKey();
    if (type === AddressType.Platform) {
        await ccKey.platform.createKey({
            passphrase,
            meta: JSON.stringify({ name })
        });
    } else {
        await ccKey.asset.createKey({
            passphrase,
            meta: JSON.stringify({ name })
        });
    }
}

export async function importKeystore(walletText: string) {
    const ccKey = await getCCKey();
    await ccKey.load(walletText);
}

export async function isKeystoreExisted() {
    return CCKey.exist({ dbType });
}

export async function getPlatformAddresses(
    networkId: NetworkId
): Promise<WalletAddress[]> {
    const ccKey = await getCCKey();
    const platformKeys = await ccKey.platform.getKeys();
    return Promise.all(
        _.map(platformKeys, async key => {
            const meta = await ccKey.platform.getMeta({ key });
            const metaObject = JSON.parse(meta);
            const address = PlatformAddress.fromAccountId(key, {
                networkId
            }).value;
            return {
                name: metaObject.name,
                address,
                type: AddressType.Platform
            };
        })
    );
}

export async function getAssetAddresses(
    networkId: NetworkId
): Promise<WalletAddress[]> {
    const ccKey = await getCCKey();
    const assetKeys = await ccKey.asset.getKeys();
    return Promise.all(
        _.map(assetKeys, async key => {
            const meta = await ccKey.asset.getMeta({ key });
            const metaObject = JSON.parse(meta);
            const address = AssetTransferAddress.fromTypeAndPayload(1, key, {
                networkId
            }).value;
            return {
                name: metaObject.name,
                address,
                type: AddressType.Asset
            };
        })
    );
}

export async function getWalletName(): Promise<string> {
    const ccKey = await getCCKey();
    const meta = await ccKey.getMeta();
    try {
        const parsedMeta = JSON.parse(meta);
        return parsedMeta.name;
    } catch (e) {
        return "Unknown";
    }
}
