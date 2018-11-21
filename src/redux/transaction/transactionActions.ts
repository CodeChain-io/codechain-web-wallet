import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { getPendingTransactions, getTxsByAddress } from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";

export type Action =
    | CachePendingTxList
    | CacheUnconfirmedTxList
    | CacheUnindexedTransferTx
    | SetFetchingPendingTxList
    | SetFetchingUnconfirmedTxList;

export enum ActionType {
    CachePendingTxList = "cachePendingTxList",
    CacheUnconfirmedTxList = "cacheUnconfirmedTxList",
    CacheUnindexedTransferTx = "cacheUnindexedTransferTx",
    SetFetchingPendingTxList = "setFetchingPendingTxList",
    SetFetchingUnconfirmedTxList = "setFetchingUnconfirmedTxList"
}

export interface CachePendingTxList {
    type: ActionType.CachePendingTxList;
    data: {
        address: string;
        pendingTxList: PendingTransactionDoc[];
    };
}

export interface CacheUnconfirmedTxList {
    type: ActionType.CacheUnconfirmedTxList;
    data: {
        address: string;
        unconfirmedTxList: TransactionDoc[];
    };
}

export interface CacheUnindexedTransferTx {
    type: ActionType.CacheUnindexedTransferTx;
    data: {
        address: string;
        transaction: AssetTransferTransaction | null;
    };
}

export interface SetFetchingPendingTxList {
    type: ActionType.SetFetchingPendingTxList;
    data: {
        address: string;
    };
}

export interface SetFetchingUnconfirmedTxList {
    type: ActionType.SetFetchingUnconfirmedTxList;
    data: {
        address: string;
    };
}

const cachePendingTxList = (
    address: string,
    pendingTxList: PendingTransactionDoc[]
): CachePendingTxList => ({
    type: ActionType.CachePendingTxList,
    data: {
        address,
        pendingTxList
    }
});

const setFetchingPendingTxList = (
    address: string
): SetFetchingPendingTxList => ({
    type: ActionType.SetFetchingPendingTxList,
    data: {
        address
    }
});

const fetchPendingTxListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedPendingTxList = getState().transactionReducer.pendingTxList[
            address
        ];
        if (cachedPendingTxList && cachedPendingTxList.isFetching) {
            return;
        }
        if (
            cachedPendingTxList &&
            cachedPendingTxList.updatedAt &&
            +new Date() - cachedPendingTxList.updatedAt < 5
        ) {
            return;
        }
        try {
            dispatch(setFetchingPendingTxList(address));
            const pendingTxList = await getPendingTransactions(
                address,
                getNetworkIdByAddress(address)
            );
            const unindexedTx = getState().transactionReducer.unindexedTx[
                address
            ];
            if (
                unindexedTx &&
                _.find(
                    pendingTxList,
                    tx =>
                        (tx as PendingTransactionDoc).transaction.data.hash ===
                        unindexedTx.hash().value
                )
            ) {
                dispatch(cacheUnindexedTransferTx(address, null));
            }
            dispatch(cachePendingTxList(address, pendingTxList));
        } catch (e) {
            console.log(e);
        }
    };
};

const cacheUnconfirmedTxList = (
    address: string,
    unconfirmedTxList: TransactionDoc[]
): CacheUnconfirmedTxList => ({
    type: ActionType.CacheUnconfirmedTxList,
    data: {
        address,
        unconfirmedTxList
    }
});

const setFetchingUnconfirmedTxList = (
    address: string
): SetFetchingUnconfirmedTxList => ({
    type: ActionType.SetFetchingUnconfirmedTxList,
    data: {
        address
    }
});

const fetchUnconfirmedTxListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedUnconfirmedTxList = getState().transactionReducer
            .unconfirmedTxList[address];
        if (cachedUnconfirmedTxList && cachedUnconfirmedTxList.isFetching) {
            return;
        }
        if (
            cachedUnconfirmedTxList &&
            cachedUnconfirmedTxList.updatedAt &&
            +new Date() - cachedUnconfirmedTxList.updatedAt < 5
        ) {
            return;
        }
        try {
            dispatch(setFetchingUnconfirmedTxList(address));
            const unconfirmedTxList = await getTxsByAddress(
                address,
                true,
                1,
                10000,
                getNetworkIdByAddress(address)
            );
            dispatch(cacheUnconfirmedTxList(address, unconfirmedTxList));
        } catch (e) {
            console.log(e);
        }
    };
};

const cacheUnindexedTransferTx = (
    address: string,
    unindexedTransferTx: AssetTransferTransaction | null
): CacheUnindexedTransferTx => ({
    type: ActionType.CacheUnindexedTransferTx,
    data: {
        address,
        transaction: unindexedTransferTx
    }
});

export default {
    fetchPendingTxListIfNeed,
    fetchUnconfirmedTxListIfNeed,
    cacheUnindexedTransferTx
};
