import axios from "axios";
import {
    AggsUTXO,
    AssetSchemeDoc,
    PendingParcelDoc,
    PendingTransactionDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction, H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { PlatformAccount } from "../model/address";

const server = {
    host: {
        cc: "https://husky.codechain.io/explorer",
        tc: "https://husky.codechain.io/explorer",
        sc: "https://saluki.codechain.io/explorer",
        wc: "https://corgi.codechain.io/explorer"
    },
    gateway: {
        cc: "https://husky.codechain.io/gateway",
        tc: "https://husky.codechain.io/gateway",
        sc: "https://saluki.codechain.io/gateway",
        wc: "https://corgi.codechain.io/gateway"
    }
};

async function getRequest<T>(url: string) {
    const response = await axios.get<T>(url);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

async function postRequest<T>(url: string, body: any) {
    const response = await axios.post<T>(url, body);
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }
    throw new Error(response.statusText);
}

export function getApiHost(networkId: string) {
    return server.host[networkId];
}

export function getGatewayHost(networkId: string) {
    // return server.gateway[networkId];
    return "http://localhost:9000";
}

export async function getAggsUTXOList(
    address: string,
    onlyConfirmed: boolean,
    networkId: string
): Promise<AggsUTXO[]> {
    const apiHost = getApiHost(networkId);

    let query = `${apiHost}/api/aggs-utxo/${address}`;
    if (onlyConfirmed) {
        query += `?onlyConfirmed=true&confirmThreshold=5`;
    }

    // FIXME: Current api will return maximum 25 entities, Use the customized pagination options.
    return await getRequest<AggsUTXO[]>(query);
}

// FIXME: Search pending parcels if this api returns null.
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
    onlyConfirmed: boolean,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    let query = `${apiHost}/api/aggs-utxo/${address}/${assetType.value}`;
    if (onlyConfirmed) {
        query += `?onlyConfirmed=true&confirmThreshold=5`;
    }

    return await getRequest<AggsUTXO | undefined>(query);
}

export async function getUTXOListByAssetType(
    address: string,
    assetType: H256,
    onlyConfirmed: boolean,
    networkId: string
) {
    const apiHost = getApiHost(networkId);

    let query = `${apiHost}/api/utxo/${address}/${assetType.value}`;
    if (onlyConfirmed) {
        query += `?onlyConfirmed=true&confirmThreshold=5`;
    }

    // FIXME: Current api will return maximum 25 entities, Use the customized pagination options.
    return await getRequest<UTXO[]>(query);
}

export async function sendTxToGateway(
    tx: AssetTransferTransaction,
    networkId: string
) {
    const gatewayHost = getGatewayHost(networkId);

    return await postRequest<void>(`${gatewayHost}/send_asset`, {
        tx
    });
}

export async function getPendingPaymentParcels(
    address: string,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    return await getRequest<PendingParcelDoc[]>(
        `${apiHost}/api/parcels/pending/${address}`
    );
}

export async function getPendingTransactions(
    address: string,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    return await getRequest<PendingTransactionDoc[]>(
        `${apiHost}/api/txs/pending/${address}`
    );
}
