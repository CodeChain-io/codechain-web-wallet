import {
    ParcelDoc,
    PendingParcelDoc,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { SDK } from "codechain-sdk";
import {
    AssetTransferTransaction,
    H256,
    SignedParcel
} from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getBestBlockNumber,
    getParcels,
    getPendingPaymentParcels,
    getPendingTransactions,
    getTxsByAddress,
    sendTxToGateway
} from "../../networks/Api";
import { getCodeChainHost } from "../../utils/network";
import accountActions from "../account/accountActions";
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
    | CacheTxListById
    | CachePendingPaymentParcelList
    | CacheUnconfirmedPaymentParcelList
    | CachePayamentParcelList
    | SetFetchingPaymentParcelList
    | SetFetchingPendingPaymentParcelList
    | SetFetchingUnconfirmedPaymentParcelList
    | SetSendingSignedParcel;

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
    CacheTxListById,
    CachePendingPaymentParcelList,
    CacheUnconfirmedPaymentParcelList,
    CachePayamentParcelList,
    SetFetchingPaymentParcelList,
    SetFetchingPendingPaymentParcelList,
    SetFetchingUnconfirmedPaymentParcelList,
    SetSendingSignedParcel
}

export interface CachePendingPaymentParcelList {
    type: ActionType.CachePendingPaymentParcelList;
    data: {
        address: string;
        pendingParcelList: PendingParcelDoc[];
    };
}

export interface CacheUnconfirmedPaymentParcelList {
    type: ActionType.CacheUnconfirmedPaymentParcelList;
    data: {
        address: string;
        parcelList: ParcelDoc[];
    };
}

export interface CachePayamentParcelList {
    type: ActionType.CachePayamentParcelList;
    data: {
        address: string;
        parcelList: ParcelDoc[];
    };
}

export interface SetFetchingPaymentParcelList {
    type: ActionType.SetFetchingPaymentParcelList;
    data: {
        address: string;
    };
}

export interface SetFetchingPendingPaymentParcelList {
    type: ActionType.SetFetchingPendingPaymentParcelList;
    data: {
        address: string;
    };
}

export interface SetFetchingUnconfirmedPaymentParcelList {
    type: ActionType.SetFetchingUnconfirmedPaymentParcelList;
    data: {
        address: string;
    };
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

export interface SetSendingSignedParcel {
    type: ActionType.SetSendingSignedParcel;
    data: {
        address: string;
        signedParcel: SignedParcel | null;
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
            dispatch(showLoading() as any);
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
            dispatch(hideLoading() as any);
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

const setSendingSignedParcel = (
    address: string,
    signedParcel: SignedParcel | null
): SetSendingSignedParcel => ({
    type: ActionType.SetSendingSignedParcel,
    data: {
        address,
        signedParcel
    }
});

let checkingIndexingFuncForSendingTx: NodeJS.Timer;
const sendTransactionByGateway = (
    address: string,
    transferTx: AssetTransferTransaction,
    gatewayURL: string
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
            dispatch(showLoading() as any);
            dispatch(setSendingTx(address, transferTx));
            await sendTxToGateway(transferTx, gatewayURL);
            checkingIndexingFuncForSendingTx = setInterval(() => {
                dispatch(fetchPendingTxListIfNeed(address));
                dispatch(fetchUnconfirmedTxListIfNeed(address));
                const pendingTxList = getState().chainReducer.pendingTxList[
                    address
                ];
                const unconfirmedTxList = getState().chainReducer
                    .unconfirmedTxList[address];
                if (
                    (pendingTxList &&
                        pendingTxList.data &&
                        _.find(
                            pendingTxList.data,
                            tx =>
                                tx.transaction.data.hash ===
                                transferTx.hash().value
                        )) ||
                    (unconfirmedTxList &&
                        unconfirmedTxList.data &&
                        _.find(
                            unconfirmedTxList.data,
                            tx => tx.data.hash === transferTx.hash().value
                        ))
                ) {
                    dispatch(setSendingTx(address, null));
                    clearInterval(checkingIndexingFuncForSendingTx);
                    dispatch(hideLoading() as any);
                }
            }, 1000);
        } catch (e) {
            console.log(e);
        }
    };
};

let checkingIndexingFuncForSendingParcel: NodeJS.Timer;
const sendSignedParcel = (address: string, signedParcel: SignedParcel) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const sendingTx = getState().chainReducer.sendingTx[address];
        if (sendingTx) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setSendingSignedParcel(address, signedParcel));
            const networkId = getState().globalReducer.networkId;
            const sdk = new SDK({
                server: getCodeChainHost(networkId),
                networkId
            });
            await sdk.rpc.chain.sendSignedParcel(signedParcel);
            checkingIndexingFuncForSendingParcel = setInterval(() => {
                dispatch(fetchPendingPaymentParcelListIfNeed(address));
                dispatch(fetchUnconfirmedPaymentParcelListIfNeed(address));
                const pendingPaymentParcelList = getState().chainReducer
                    .pendingPaymentParcelList[address];
                const unconfirmedPaymentParcelList = getState().chainReducer
                    .unconfirmedPaymentParcelList[address];
                if (
                    (pendingPaymentParcelList &&
                        pendingPaymentParcelList.data &&
                        _.find(
                            pendingPaymentParcelList.data,
                            ppp => ppp.parcel.hash === signedParcel.hash().value
                        )) ||
                    (unconfirmedPaymentParcelList &&
                        unconfirmedPaymentParcelList.data &&
                        _.find(
                            unconfirmedPaymentParcelList.data,
                            upp => upp.hash === signedParcel.hash().value
                        ))
                ) {
                    dispatch(setSendingSignedParcel(address, null));
                    clearInterval(checkingIndexingFuncForSendingParcel);
                    dispatch(hideLoading() as any);
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
            dispatch(showLoading() as any);
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
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchPaymentParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const paymentParcelList = getState().chainReducer.paymentParcelList[
            address
        ];
        if (paymentParcelList && paymentParcelList.isFetching) {
            return;
        }
        if (
            paymentParcelList &&
            paymentParcelList.updatedAt &&
            +new Date() - paymentParcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingPaymentParcelList,
                data: {
                    address
                }
            });
            const networkId = getState().globalReducer.networkId;
            // FIXME: Add pagination
            const parcelList = await getParcels(
                address,
                false,
                1,
                10,
                networkId
            );
            dispatch({
                type: ActionType.CachePayamentParcelList,
                data: {
                    address,
                    parcelList
                }
            });
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchUnconfirmedPaymentParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedUnconfirmedPaymentParcelList = getState().chainReducer
            .unconfirmedPaymentParcelList[address];
        if (
            cachedUnconfirmedPaymentParcelList &&
            cachedUnconfirmedPaymentParcelList.isFetching
        ) {
            return;
        }
        if (
            cachedUnconfirmedPaymentParcelList &&
            cachedUnconfirmedPaymentParcelList.updatedAt &&
            +new Date() - cachedUnconfirmedPaymentParcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingUnconfirmedPaymentParcelList,
                data: {
                    address
                }
            });
            const networkId = getState().globalReducer.networkId;
            const parcelList = await getParcels(
                address,
                true,
                1,
                10000,
                networkId
            );
            dispatch({
                type: ActionType.CacheUnconfirmedPaymentParcelList,
                data: {
                    address,
                    parcelList
                }
            });
            dispatch(accountActions.calculateAvailableQuark(address));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchPendingPaymentParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedPendingPaymentParcelList = getState().chainReducer
            .pendingPaymentParcelList[address];
        if (
            cachedPendingPaymentParcelList &&
            cachedPendingPaymentParcelList.isFetching
        ) {
            return;
        }
        if (
            cachedPendingPaymentParcelList &&
            cachedPendingPaymentParcelList.updatedAt &&
            +new Date() - cachedPendingPaymentParcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingPendingPaymentParcelList,
                data: { address }
            });
            const networkId = getState().globalReducer.networkId;
            const pendingParcelList = await getPendingPaymentParcels(
                address,
                networkId
            );
            dispatch({
                type: ActionType.CachePendingPaymentParcelList,
                data: {
                    address,
                    pendingParcelList
                }
            });
            dispatch(accountActions.calculateAvailableQuark(address));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    fetchPendingTxListIfNeed,
    fetchUnconfirmedTxListIfNeed,
    sendTransactionByGateway,
    fetchBestBlockNumberIfNeed,
    fetchTxListIfNeed,
    fetchTxListByAssetTypeIfNeed,
    fetchPaymentParcelListIfNeed,
    fetchUnconfirmedPaymentParcelListIfNeed,
    fetchPendingPaymentParcelListIfNeed,
    sendSignedParcel
};
