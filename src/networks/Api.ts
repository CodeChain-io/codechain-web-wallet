import axios from "axios";
import {
    AggsUTXO,
    AssetSchemeDoc,
    ParcelDoc,
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
import { NetworkId } from "codechain-sdk/lib/core/types";
import * as _ from "lodash";
import { PlatformAccount } from "../model/address";
import { getIndexerHost } from "../utils/network";

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

export function getGatewayHost(networkId: NetworkId) {
    // return server.gateway[networkId];
    return "http://localhost:9000";
}

export async function getAggsUTXOList(
    address: string,
    networkId: NetworkId
): Promise<AggsUTXO[]> {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<AggsUTXO[]>(`${apiHost}/api/aggs-utxo/${address}`);
}

export async function getAssetByAssetType(
    assetType: H256,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset/${assetType.value}`
    );
}

export async function getPlatformAccount(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    const response = await getRequest<{ balance: string; nonce: string }>(
        `${apiHost}/api/addr-platform-account/${address}`
    );

    if (response) {
        return {
            balance: new U256(response.balance),
            nonce: new U256(response.nonce)
        } as PlatformAccount;
    } else {
        return {
            balance: new U256(0),
            nonce: new U256(0)
        } as PlatformAccount;
    }
}

export async function getUTXOListByAssetType(
    address: string,
    assetType: H256,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<UTXO[]>(
        `${apiHost}/api/utxo/${
            assetType.value
        }/owner/${address}?itemsPerPage=10000&page=1`
    );
}

export async function sendTxToGateway(
    tx: AssetTransferTransaction,
    gatewayURl: string
) {
    console.log(gatewayURl);
    return await postRequest<void>(`${gatewayURl}`, {
        tx
    });
}

export async function getPendingPaymentParcels(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<PendingParcelDoc[]>(
        `${apiHost}/api/parcels/pending/${address}`
    );
}

export async function getParcels(
    address: string,
    onlyUnconfirmed: boolean,
    page: number,
    itemsPerPage: number,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    let query = `${apiHost}/api/parcels?address=${address}&page=${page}&itemsPerPage=${itemsPerPage}`;
    if (onlyUnconfirmed) {
        query += `&onlyUnconfirmed=true&confirmThreshold=5`;
    }
    return await getRequest<ParcelDoc[]>(query);
}

export async function getPendingTransactions(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<PendingTransactionDoc[]>(
        `${apiHost}/api/txs/pending/${address}`
    );
}

export async function getTxsByAddress(
    address: string,
    onlyUnconfirmed: boolean,
    page: number,
    itemsPerPage: number,
    networkId: NetworkId,
    assetType?: H256
) {
    const apiHost = getIndexerHost(networkId);
    let query = `${apiHost}/api/txs?address=${address}&page=${page}&itemsPerPage=${itemsPerPage}`;
    if (onlyUnconfirmed) {
        query += `&onlyUnconfirmed=true&confirmThreshold=5`;
    }
    if (assetType) {
        query += `&assetType=${assetType.value}`;
    }
    return await getRequest<TransactionDoc[]>(query);
}

export async function getBestBlockNumber(networkId: string) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<number>(`${apiHost}/api/blockNumber`);
}
