import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction, H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getBestBlockNumber,
    getPendingTransactions,
    getTxsByAddress,
    sendTxToGateway
} from "../../networks/Api";
import assetActions from "../asset/assetActions";
import { getIdByAddressAssetType } from "./chainReducer";

export type Action =
    | CachePendingTxList
    | CacheUnconfirmedTxList
    | CacheTxList
    | SetFetchingPendingTxList
    | SetFetchingUnconfirmedTxList
    | SetFetchingTxList
    | SetSendingTx
    | UpdateBestBlockNumber
    | SetFetchingBestBlockNumber
    | SetFetchingTxListById
    | CacheTxListById;

export enum ActionType {
    CachePendingTxList = 2000,
    CacheUnconfirmedTxList,
    CacheTxList,
    SetFetchingPendingTxList,
    SetFetchingUnconfirmedTxList,
    SetSendingTx,
    UpdateBestBlockNumber,
    SetFetchingBestBlockNumber,
    SetFetchingTxList,
    SetFetchingTxListById,
    CacheTxListById
}

export interface SetFetchingTxListById {
    type: ActionType.SetFetchingTxListById;
    data: {
        address: string;
        assetType: H256;
    };
}

export interface CacheTxListById {
    type: ActionType.CacheTxListById;
    data: {
        address: string;
        assetType: H256;
        txList: TransactionDoc[];
    };
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

export interface CacheTxList {
    type: ActionType.CacheTxList;
    data: {
        address: string;
        txList: TransactionDoc[];
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

export interface SetFetchingTxList {
    type: ActionType.SetFetchingTxList;
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

export interface UpdateBestBlockNumber {
    type: ActionType.UpdateBestBlockNumber;
    data: {
        bestBlockNumber: number;
    };
}

export interface SetFetchingBestBlockNumber {
    type: ActionType.SetFetchingBestBlockNumber;
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
        const cachedPendingTxList = getState().chainReducer.pendingTxList[
            address
        ];
        if (cachedPendingTxList && cachedPendingTxList.isFetching) {
            return;
        }
        if (
            cachedPendingTxList &&
            cachedPendingTxList.updatedAt &&
            +new Date() - cachedPendingTxList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setFetchingPendingTxList(address));
            const networkId = getState().globalReducer.networkId;
            const pendingTxList = await getPendingTransactions(
                address,
                networkId
            );
            dispatch(cachePendingTxList(address, pendingTxList));
            dispatch(assetActions.calculateAvailableAssets(address));
            dispatch(hideLoading() as any);
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
        const cachedUnconfirmedTxList = getState().chainReducer
            .unconfirmedTxList[address];
        if (cachedUnconfirmedTxList && cachedUnconfirmedTxList.isFetching) {
            return;
        }
        if (
            cachedUnconfirmedTxList &&
            cachedUnconfirmedTxList.updatedAt &&
            +new Date() - cachedUnconfirmedTxList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setFetchingUnconfirmedTxList(address));
            const networkId = getState().globalReducer.networkId;
            const unconfirmedTxList = await getTxsByAddress(
                address,
                true,
                1,
                10000,
                networkId
            );
            dispatch(cacheUnconfirmedTxList(address, unconfirmedTxList));
            dispatch(assetActions.calculateAvailableAssets(address));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchTxListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedTxList = getState().chainReducer.txList[address];
        if (cachedTxList && cachedTxList.isFetching) {
            return;
        }
        if (
            cachedTxList &&
            cachedTxList.updatedAt &&
            +new Date() - cachedTxList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch({
                type: ActionType.SetFetchingTxList,
                data: {
                    address
                }
            });
            const networkId = getState().globalReducer.networkId;
            // FIXME: Add pagination
            const txList = await getTxsByAddress(
                address,
                false,
                1,
                10,
                networkId
            );
            dispatch({
                type: ActionType.CacheTxList,
                data: {
                    address,
                    txList
                }
            });
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
        const sendingTx = getState().chainReducer.sendingTx[address];
        if (sendingTx) {
            return;
        }
        try {
            dispatch(setSendingTx(address, transferTx));
            const networkId = getState().globalReducer.networkId;
            await sendTxToGateway(transferTx, networkId);
            checkingIndexingFunc = setInterval(() => {
                dispatch(fetchPendingTxListIfNeed(address));
                const pendingTxList = getState().chainReducer.pendingTxList[
                    address
                ];
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

const fetchBestBlockNumberIfNeed = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const bestBlockNumber = getState().chainReducer.bestBlockNumber;
        if (bestBlockNumber && bestBlockNumber.isFetching) {
            return;
        }
        if (
            bestBlockNumber &&
            bestBlockNumber.updatedAt &&
            +new Date() - bestBlockNumber.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({ type: ActionType.SetFetchingBestBlockNumber });
            const networkId = getState().globalReducer.networkId;
            const updatedBestBlockNumber = await getBestBlockNumber(networkId);
            dispatch({
                type: ActionType.UpdateBestBlockNumber,
                data: { bestBlockNumber: updatedBestBlockNumber }
            });
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchTxListByAssetTypeIfNeed = (address: string, assetType: H256) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const id = getIdByAddressAssetType(address, assetType);
        const cachedTxListById = getState().chainReducer.txListById[id];
        if (cachedTxListById && cachedTxListById.isFetching) {
            return;
        }
        if (
            cachedTxListById &&
            cachedTxListById.updatedAt &&
            +new Date() - cachedTxListById.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch({
                type: ActionType.SetFetchingTxListById,
                data: {
                    address,
                    assetType
                }
            });
            const networkId = getState().globalReducer.networkId;
            // FIXME: Add pagination
            const txList = await getTxsByAddress(
                address,
                false,
                1,
                10,
                networkId,
                assetType
            );
            dispatch({
                type: ActionType.CacheTxListById,
                data: {
                    address,
                    assetType,
                    txList
                }
            });
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    fetchPendingTxListIfNeed,
    fetchUnconfirmedTxListIfNeed,
    sendTransaction,
    fetchBestBlockNumberIfNeed,
    fetchTxListIfNeed,
    fetchTxListByAssetTypeIfNeed
};
