import axios from "axios";
import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import { PlatformAccount } from "../model/address";
import { AddressUTXO } from "../model/asset";

// FIXME: Change the default host
const apiHost = process.env.APIHost || "https://husky.codechain.io/explorer";

async function getRequest<T>(url: string) {
    const response = await axios.get<T>(url);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

export async function getUTXOList(address: string) {
    return getRequest<AddressUTXO[]>(`${apiHost}/api/utxo/${address}`);
}

export async function getAssetByAssetType(assetType: H256) {
    console.log(assetType);
    console.log(assetType.value);
    console.log(`${apiHost}/api/asset/${assetType.value}`);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset/${assetType.value}`
    );
}

export async function getPlatformAccount(address: string) {
    return await getRequest<PlatformAccount>(
        `${apiHost}/api/addr-platform-account/${address}`
    );
}
