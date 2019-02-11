import axios from "axios";
import {
    AggsUTXODoc,
    AssetSchemeDoc,
    TransactionDoc,
    UTXODoc
} from "codechain-indexer-types";
import { H160, H256, Transaction, U64 } from "codechain-sdk/lib/core/classes";
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
): Promise<AggsUTXODoc[]> {
    const apiHost = getIndexerHost(networkId);
    const aggsUTXOList = await getRequest<AggsUTXODoc[]>(
        `${apiHost}/api/aggs-utxo?address=${address}`
    );
    // FIXME: https://github.com/CodeChain-io/codechain-indexer/issues/59
    return Promise.all(
        aggsUTXOList.map(async (aggsUTXO: any) => {
            const assetScheme = await getAssetByAssetType(
                new H160(aggsUTXO.assetType),
                networkId
            );
            aggsUTXO.assetScheme = assetScheme;
            return aggsUTXO;
        })
    );
}

export async function getAssetByAssetType(
    assetType: H160,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return getRequest<AssetSchemeDoc>(
        `${apiHost}/api/asset-scheme/${assetType.value}`
    );
}

export async function getPlatformAccount(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    const response = await getRequest<{ balance: string; nonce: string }>(
        `${apiHost}/api/account/${address}`
    );

    if (response) {
        return {
            balance: new U64(response.balance),
            nonce: new U64(response.nonce)
        } as PlatformAccount;
    } else {
        return {
            balance: new U64(0),
            nonce: new U64(0)
        } as PlatformAccount;
    }
}

export async function getUTXOListByAssetType(
    address: string,
    assetType: H160,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<UTXODoc[]>(
        `${apiHost}/api/utxo/${
            assetType.value
        }?address=${address}&itemsPerPage=10000&page=1`
    );
}

export function sendTxToGateway(tx: Transaction, gatewayURl: string) {
    return postRequest<void>(`${gatewayURl}`, {
        tx
    });
}

export async function getPendingTransactions(
    address: string,
    networkId: NetworkId
) {
    const apiHost = getIndexerHost(networkId);
    return await getRequest<TransactionDoc[]>(
        `${apiHost}/api/pending-tx?page=1&itemsPerPage=10000&address=${address}`
    );
}

export async function getTxsByAddress(
    address: string,
    page: number,
    itemsPerPage: number,
    networkId: NetworkId,
    assetType?: H256
) {
    const apiHost = getIndexerHost(networkId);
    let query = `${apiHost}/api/tx?address=${address}&page=${page}&itemsPerPage=${itemsPerPage}`;
    if (assetType) {
        query += `&assetType=${assetType.value}`;
    }
    return await getRequest<TransactionDoc[]>(query);
}
