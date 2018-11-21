import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getPendingTransactions,
    getTxsByAddress,
    sendTxToGateway
} from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";

export type Action =
    | CachePendingTxList
    | CacheUnconfirmedTxList
    | SetFetchingPendingTxList
    | SetFetchingUnconfirmedTxList
    | SetSendingTx;

export enum ActionType {
    CachePendingTxList = "cachePendingTxList",
    CacheUnconfirmedTxList = "cacheUnconfirmedTxList",
    SetFetchingPendingTxList = "setFetchingPendingTxList",
    SetFetchingUnconfirmedTxList = "setFetchingUnconfirmedTxList",
    SetSendingTx = "setSendingTx"
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

export interface SetSendingTx {
    type: ActionType.SetSendingTx;
    data: {
        address: string;
        tx: AssetTransferTransaction | null;
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
            +new Date() - cachedPendingTxList.updatedAt < 3
        ) {
            return;
        }
        try {
            dispatch(setFetchingPendingTxList(address));
            const pendingTxList = await getPendingTransactions(
                address,
                getNetworkIdByAddress(address)
            );
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

const setSendingTx = (
    address: string,
    transferTx: AssetTransferTransaction | null
): SetSendingTx => ({
    type: ActionType.SetSendingTx,
    data: {
        address,
        tx: transferTx
    }
});

let checkingIndexingFunc: NodeJS.Timer;
const sendTransaction = (
    address: string,
    transferTx: AssetTransferTransaction
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const sendingTx = getState().transactionReducer.sendingTx[address];
        if (sendingTx) {
            return;
        }
        try {
            dispatch(setSendingTx(address, transferTx));
            await sendTxToGateway(transferTx, getNetworkIdByAddress(address));
            checkingIndexingFunc = setInterval(() => {
                dispatch(fetchPendingTxListIfNeed(address));
                const pendingTxList = getState().transactionReducer
                    .pendingTxList[address];
                if (
                    pendingTxList &&
                    pendingTxList.data &&
                    _.find(
                        pendingTxList.data,
                        tx =>
                            tx.transaction.data.hash === transferTx.hash().value
                    )
                ) {
                    dispatch(setSendingTx(address, null));
                    clearInterval(checkingIndexingFunc);
                }
            }, 1000);
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    fetchPendingTxListIfNeed,
    fetchUnconfirmedTxListIfNeed,
    sendTransaction
};
