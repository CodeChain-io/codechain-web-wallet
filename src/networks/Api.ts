import axios from "axios";
import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { PlatformAccount } from "../model/address";
import { AggsUTXO } from "../model/asset";

const server = {
    host: {
        cc: "https://husky.codechain.io/explorer",
        tc: "https://husky.codechain.io/explorer",
        sc: "https://saluki.codechain.io/explorer",
        wc: "https://corgi.codechain.io/explorer"
    }
};

async function getRequest<T>(url: string) {
    const response = await axios.get<T>(url);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

export function getApiHost(networkId: string) {
    return server.host[networkId];
}

export async function getAggsUTXOList(
    address: string,
    networkId: string
): Promise<AggsUTXO[]> {
    const apiHost = getApiHost(networkId);
    const response = await getRequest<
        {
            assetType: string;
            totalAssetQuantity: number;
            utxoQuantity: number;
        }[]
    >(`${apiHost}/api/aggs-utxo/${address}`);
    return _.map(response, r => ({
        assetType: new H256(r.assetType),
        totalAssetQuantity: r.totalAssetQuantity,
        utxoQuantity: r.utxoQuantity
    }));
}

export async function getAssetByAssetType(assetType: H256, networkId: string) {
    const apiHost = getApiHost(networkId);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset/${assetType.value}`
    );
}

export async function getPlatformAccount(address: string, networkId: string) {
    const apiHost = getApiHost(networkId);
    return await getRequest<PlatformAccount>(
        `${apiHost}/api/addr-platform-account/${address}`
    );
}

export async function getAggsUTXOByAssetType(
    address: string,
    assetType: H256,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    return await getRequest<AggsUTXO | undefined>(
        `${apiHost}/api/aggs-utxo/${address}/${assetType.value}`
    );
}
