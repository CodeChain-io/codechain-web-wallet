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
import { toast } from "react-toastify";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getBestBlockNumber,
    getParcels,
    getPendingParcels,
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
    | CachePendingParcelList
    | CacheUnconfirmedParcelList
    | CachePayamentParcelList
    | SetFetchingParcelList
    | SetFetchingPendingParcelList
    | SetFetchingUnconfirmedParcelList
    | SetSendingSignedParcel;

export enum ActionType {
    CachePendingTxList = "CachePendingTxList",
    CacheUnconfirmedTxList = "CacheUnconfirmedTxList",
    CacheTxList = "CacheTxList",
    SetFetchingPendingTxList = "SetFetchingPendingTxList",
    SetFetchingUnconfirmedTxList = "SetFetchingUnconfirmedTxList",
    SetSendingTx = "SetSendingTx",
    UpdateBestBlockNumber = "UpdateBestBlockNumber",
    SetFetchingBestBlockNumber = "SetFetchingBestBlockNumber",
    SetFetchingTxList = "SetFetchingTxList",
    SetFetchingTxListById = "SetFetchingTxListById",
    CacheTxListById = "CacheTxListById",
    CachePendingParcelList = "CachePendingParcelList",
    CacheUnconfirmedParcelList = "CacheUnconfirmedParcelList",
    CacheParcelList = "CacheParcelList",
    SetFetchingParcelList = "SetFetchingParcelList",
    SetFetchingPendingParcelList = "SetFetchingPendingParcelList",
    SetFetchingUnconfirmedParcelList = "SetFetchingUnconfirmedParcelList",
    SetSendingSignedParcel = "SetSendingSignedParcel"
}

export interface CachePendingParcelList {
    type: ActionType.CachePendingParcelList;
    data: {
        address: string;
        pendingParcelList: PendingParcelDoc[];
    };
}

export interface CacheUnconfirmedParcelList {
    type: ActionType.CacheUnconfirmedParcelList;
    data: {
        address: string;
        parcelList: ParcelDoc[];
    };
}

export interface CachePayamentParcelList {
    type: ActionType.CacheParcelList;
    data: {
        address: string;
        parcelList: ParcelDoc[];
    };
}

export interface SetFetchingParcelList {
    type: ActionType.SetFetchingParcelList;
    data: {
        address: string;
    };
}

export interface SetFetchingPendingParcelList {
    type: ActionType.SetFetchingPendingParcelList;
    data: {
        address: string;
    };
}

export interface SetFetchingUnconfirmedParcelList {
    type: ActionType.SetFetchingUnconfirmedParcelList;
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
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                dispatch(assetActions.calculateAvailableAssets(address));
            }, 300);
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
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                dispatch(assetActions.calculateAvailableAssets(address));
            }, 300);
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

const sendTransactionByParcel = (
    address: string,
    signedParcel: SignedParcel,
    transferTx: AssetTransferTransaction,
    feePayer: string
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
            const networkId = getState().globalReducer.networkId;
            const sdk = new SDK({
                server: getCodeChainHost(networkId),
                networkId
            });
            await sdk.rpc.chain.sendSignedParcel(signedParcel);
            checkingIndexingFuncForSendingTx = setInterval(() => {
                dispatch(fetchPendingTxListIfNeed(address));
                dispatch(fetchUnconfirmedTxListIfNeed(address));
                dispatch(fetchParcelListIfNeed(feePayer));
                dispatch(fetchPendingParcelListIfNeed(feePayer));
                const pendingTxList = getState().chainReducer.pendingTxList[
                    address
                ];
                const unconfirmedTxList = getState().chainReducer
                    .unconfirmedTxList[address];
                const parcelList = getState().chainReducer.parcelList[feePayer];
                const pendingParcelList = getState().chainReducer
                    .pendingParcelList[feePayer];
                if (
                    ((pendingTxList &&
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
                            ))) &&
                    ((parcelList &&
                        parcelList.data &&
                        _.find(
                            parcelList.data,
                            parcel => parcel.hash === signedParcel.hash().value
                        )) ||
                        (pendingParcelList &&
                            pendingParcelList.data &&
                            _.find(
                                pendingParcelList.data,
                                pendingParcel =>
                                    pendingParcel.parcel.hash ===
                                    signedParcel.hash().value
                            )))
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
            dispatch(setSendingTx(address, null));
            dispatch(hideLoading() as any);

            console.log(e);
            toast.error("Gateway is not responding.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 3000,
                closeButton: false,
                hideProgressBar: true
            });
        }
    };
};

let checkingIndexingFuncForSendingParcel: NodeJS.Timer;
const sendSignedParcel = (address: string, signedParcel: SignedParcel) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const sendingSignedParcel = getState().chainReducer.sendingSignedParcel[
            address
        ];
        if (sendingSignedParcel) {
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
                dispatch(fetchPendingParcelListIfNeed(address));
                dispatch(fetchUnconfirmedParcelListIfNeed(address));
                const pendingParcelList = getState().chainReducer
                    .pendingParcelList[address];
                const unconfirmedParcelList = getState().chainReducer
                    .unconfirmedParcelList[address];
                if (
                    (pendingParcelList &&
                        pendingParcelList.data &&
                        _.find(
                            pendingParcelList.data,
                            ppp => ppp.parcel.hash === signedParcel.hash().value
                        )) ||
                    (unconfirmedParcelList &&
                        unconfirmedParcelList.data &&
                        _.find(
                            unconfirmedParcelList.data,
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

const fetchParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const parcelList = getState().chainReducer.parcelList[address];
        if (parcelList && parcelList.isFetching) {
            return;
        }
        if (
            parcelList &&
            parcelList.updatedAt &&
            +new Date() - parcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingParcelList,
                data: {
                    address
                }
            });
            const networkId = getState().globalReducer.networkId;
            // FIXME: Add pagination
            const parcelResponse = await getParcels(
                address,
                false,
                1,
                10,
                networkId
            );
            dispatch({
                type: ActionType.CacheParcelList,
                data: {
                    address,
                    parcelList: parcelResponse
                }
            });
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchUnconfirmedParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedUnconfirmedParcelList = getState().chainReducer
            .unconfirmedParcelList[address];
        if (
            cachedUnconfirmedParcelList &&
            cachedUnconfirmedParcelList.isFetching
        ) {
            return;
        }
        if (
            cachedUnconfirmedParcelList &&
            cachedUnconfirmedParcelList.updatedAt &&
            +new Date() - cachedUnconfirmedParcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingUnconfirmedParcelList,
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
                type: ActionType.CacheUnconfirmedParcelList,
                data: {
                    address,
                    parcelList
                }
            });
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                dispatch(accountActions.calculateAvailableQuark(address));
            }, 300);
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchPendingParcelListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedPendingParcelList = getState().chainReducer
            .pendingParcelList[address];
        if (cachedPendingParcelList && cachedPendingParcelList.isFetching) {
            return;
        }
        if (
            cachedPendingParcelList &&
            cachedPendingParcelList.updatedAt &&
            +new Date() - cachedPendingParcelList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch({
                type: ActionType.SetFetchingPendingParcelList,
                data: { address }
            });
            const networkId = getState().globalReducer.networkId;
            const pendingParcelList = await getPendingParcels(
                address,
                networkId
            );
            dispatch({
                type: ActionType.CachePendingParcelList,
                data: {
                    address,
                    pendingParcelList
                }
            });
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                dispatch(accountActions.calculateAvailableQuark(address));
            }, 300);
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
    fetchParcelListIfNeed,
    fetchUnconfirmedParcelListIfNeed,
    fetchPendingParcelListIfNeed,
    sendSignedParcel,
    sendTransactionByParcel
};
