import axios from "axios";
import {
    AggsUTXODoc,
    AssetSchemeDoc,
    TransactionDoc,
    UTXODoc
} from "codechain-indexer-types";
import { H160, Transaction, U64 } from "codechain-sdk/lib/core/classes";
import { NetworkId } from "codechain-sdk/lib/core/types";
import _ from "lodash";
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
    const response = await getRequest<{ balance: string; seq: string }>(
        `${apiHost}/api/account/${address}`
    );

    if (response) {
        return {
            balance: new U64(response.balance),
            seq: new U64(response.seq)
        } as PlatformAccount;
    } else {
        return {
            balance: new U64(0),
            seq: new U64(0)
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
        `${apiHost}/api/utxo?assetType=${
            assetType.value
        }&address=${address}&itemsPerPage=100&page=1`
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
    const transactions = await getRequest<TransactionDoc[]>(
        `${apiHost}/api/pending-tx?page=1&itemsPerPage=100&address=${address}`
    );

    // FIXME: This is temporary code. https://github.com/CodeChain-io/codechain-indexer/issues/5
    await Promise.all(
        transactions.map(async transaction => {
            if (transaction.type === "transferAsset") {
                await Promise.all(
                    transaction.transferAsset.outputs.map(async output => {
                        const assetScheme: any = await getRequest<
                            AssetSchemeDoc
                        >(`${apiHost}/api/asset-scheme/${output.assetType}`);
                        output.assetScheme = assetScheme;
                    })
                );
            }
        })
    );
    return transactions;
}

export async function getTxsByAddress(
    address: string,
    page: number,
    itemsPerPage: number,
    networkId: NetworkId,
    assetType?: H160
) {
    const apiHost = getIndexerHost(networkId);
    let query = `${apiHost}/api/tx?address=${address}&page=${page}&itemsPerPage=${itemsPerPage}`;
    if (assetType) {
        query += `&assetType=${assetType.value}`;
    }
    const transactions = await getRequest<TransactionDoc[]>(query);

    // FIXME: This is temporary code. https://github.com/CodeChain-io/codechain-indexer/issues/5
    await Promise.all(
        transactions.map(async transaction => {
            if (transaction.type === "transferAsset") {
                await Promise.all(
                    transaction.transferAsset.outputs.map(async output => {
                        const assetScheme: any = await getRequest<
                            AssetSchemeDoc
                        >(`${apiHost}/api/asset-scheme/${output.assetType}`);
                        output.assetScheme = assetScheme;
                    })
                );
            }
        })
    );
    return transactions;
}

export async function getCountOfTxByAddress(data: {
    address: string;
    networkId: NetworkId;
    assetType?: H160;
}) {
    const apiHost = getIndexerHost(data.networkId);
    let query = `${apiHost}/api/tx/count?address=${data.address}`;
    if (data.assetType) {
        query += `&assetType=${data.assetType.value}`;
    }
    return await getRequest<number>(query);
}
