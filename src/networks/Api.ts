import axios from "axios";
import {
    AggsUTXO,
    AssetSchemeDoc,
    PendingParcelDoc,
    PendingTransactionDoc,
    TransactionDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import {
    AssetTransferTransaction,
    H256,
    U256
} from "codechain-sdk/lib/core/classes";
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
    networkId: string
): Promise<AggsUTXO[]> {
    const apiHost = getApiHost(networkId);
    return await getRequest<AggsUTXO[]>(`${apiHost}/api/aggs-utxo/${address}`);
}

export async function getAssetByAssetType(assetType: H256, networkId: string) {
    const apiHost = getApiHost(networkId);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset/${assetType.value}`
    );
}

export async function getPlatformAccount(address: string, networkId: string) {
    const apiHost = getApiHost(networkId);
    const response = await getRequest<{ balance: string; nonce: string }>(
        `${apiHost}/api/addr-platform-account/${address}`
    );

    return {
        balance: new U256(response.balance),
        nonce: new U256(response.nonce)
    } as PlatformAccount;
}

export async function getUTXOListByAssetType(
    address: string,
    assetType: H256,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    return await getRequest<UTXO[]>(
        `${apiHost}/api/utxo/${assetType.value}/owner/${address}`
    );
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
        `${apiHost}/api/addr-asset-txs/pending/${address}`
    );
}

export async function getTxsByAddress(
    address: string,
    onlyUnconfirmed: boolean,
    page: number,
    itemsPerPage: number,
    networkId: string
) {
    const apiHost = getApiHost(networkId);
    let query = `${apiHost}/api/addr-asset-txs/${address}?page=${page}&itemsPerPage=${itemsPerPage}`;
    if (onlyUnconfirmed) {
        query += `&onlyUnconfirmed=true&confirmThreshold=5`;
    }
    return await getRequest<TransactionDoc[]>(query);
}

export async function getBestBlockNumber(networkId: string) {
    const apiHost = getApiHost(networkId);
    return await getRequest<number>(`${apiHost}/api/blockNumber`);
}
