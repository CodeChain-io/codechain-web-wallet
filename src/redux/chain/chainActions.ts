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
    | CacheTxList
    | SetFetchingPendingTxList
    | SetFetchingTxList
    | UpdateBestBlockNumber
    | SetFetchingBestBlockNumber
    | SetFetchingTxListById
    | CacheTxListById
    | CachePendingParcelList
    | CachePayamentParcelList
    | SetFetchingParcelList
    | SetFetchingPendingParcelList;

export enum ActionType {
    CachePendingTxList = "CachePendingTxList",
    CacheTxList = "CacheTxList",
    SetFetchingPendingTxList = "SetFetchingPendingTxList",
    UpdateBestBlockNumber = "UpdateBestBlockNumber",
    SetFetchingBestBlockNumber = "SetFetchingBestBlockNumber",
    SetFetchingTxList = "SetFetchingTxList",
    SetFetchingTxListById = "SetFetchingTxListById",
    CacheTxListById = "CacheTxListById",
    CachePendingParcelList = "CachePendingParcelList",
    CacheParcelList = "CacheParcelList",
    SetFetchingParcelList = "SetFetchingParcelList",
    SetFetchingPendingParcelList = "SetFetchingPendingParcelList"
}

export interface CachePendingParcelList {
    type: ActionType.CachePendingParcelList;
    data: {
        address: string;
        pendingParcelList: PendingParcelDoc[];
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

export interface SetFetchingTxList {
    type: ActionType.SetFetchingTxList;
    data: {
        address: string;
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
            const txList = await getTxsByAddress(address, 1, 10, networkId);
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
        return new Promise(async (resolve, reject) => {
            try {
                const networkId = getState().globalReducer.networkId;
                const sdk = new SDK({
                    server: getCodeChainHost(networkId),
                    networkId
                });
                await sdk.rpc.chain.sendSignedParcel(signedParcel);
                checkingIndexingFuncForSendingTx = setInterval(() => {
                    dispatch(fetchPendingTxListIfNeed(address));
                    dispatch(fetchParcelListIfNeed(feePayer));
                    dispatch(fetchPendingParcelListIfNeed(feePayer));
                    const pendingTxList = getState().chainReducer.pendingTxList[
                        address
                    ];
                    const txList = getState().chainReducer.txList[address];
                    const parcelList = getState().chainReducer.parcelList[
                        feePayer
                    ];
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
                            (txList &&
                                txList.data &&
                                _.find(
                                    txList.data,
                                    tx =>
                                        tx.data.hash === transferTx.hash().value
                                ))) &&
                        ((parcelList &&
                            parcelList.data &&
                            _.find(
                                parcelList.data,
                                parcel =>
                                    parcel.hash === signedParcel.hash().value
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
                        dispatch(accountActions.fetchAccountIfNeed(address));
                        dispatch(assetActions.fetchAggsUTXOListIfNeed(address));
                        clearInterval(checkingIndexingFuncForSendingTx);
                        resolve();
                    }
                }, 1000);
            } catch (e) {
                reject(e);
                console.error(e);
            }
        });
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
        return new Promise(async (resolve, reject) => {
            try {
                await sendTxToGateway(transferTx, gatewayURL);
                checkingIndexingFuncForSendingTx = setInterval(() => {
                    dispatch(fetchPendingTxListIfNeed(address));
                    dispatch(fetchTxListIfNeed(address));
                    const pendingTxList = getState().chainReducer.pendingTxList[
                        address
                    ];
                    const txList = getState().chainReducer.txList[address];
                    if (
                        (pendingTxList &&
                            pendingTxList.data &&
                            _.find(
                                pendingTxList.data,
                                tx =>
                                    tx.transaction.data.hash ===
                                    transferTx.hash().value
                            )) ||
                        (txList &&
                            txList.data &&
                            _.find(
                                txList.data,
                                tx => tx.data.hash === transferTx.hash().value
                            ))
                    ) {
                        dispatch(assetActions.fetchAggsUTXOListIfNeed(address));
                        clearInterval(checkingIndexingFuncForSendingTx);
                        resolve();
                    }
                }, 1000);
            } catch (e) {
                reject(e);
                console.error(e);
            }
        });
    };
};

let checkingIndexingFuncForSendingParcel: NodeJS.Timer;
const sendSignedParcel = (address: string, signedParcel: SignedParcel) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                const networkId = getState().globalReducer.networkId;
                const sdk = new SDK({
                    server: getCodeChainHost(networkId),
                    networkId
                });
                await sdk.rpc.chain.sendSignedParcel(signedParcel);
                checkingIndexingFuncForSendingParcel = setInterval(() => {
                    dispatch(fetchPendingParcelListIfNeed(address));
                    dispatch(fetchParcelListIfNeed(address));
                    const pendingParcelList = getState().chainReducer
                        .pendingParcelList[address];
                    const parcelList = getState().chainReducer.parcelList[
                        address
                    ];
                    if (
                        (pendingParcelList &&
                            pendingParcelList.data &&
                            _.find(
                                pendingParcelList.data,
                                ppp =>
                                    ppp.parcel.hash ===
                                    signedParcel.hash().value
                            )) ||
                        (parcelList &&
                            parcelList.data &&
                            _.find(
                                parcelList.data,
                                upp => upp.hash === signedParcel.hash().value
                            ))
                    ) {
                        clearInterval(checkingIndexingFuncForSendingParcel);
                        resolve();
                    }
                }, 1000);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
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
            const parcelResponse = await getParcels(address, 1, 10, networkId);
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
    sendTransactionByGateway,
    fetchBestBlockNumberIfNeed,
    fetchTxListIfNeed,
    fetchTxListByAssetTypeIfNeed,
    fetchParcelListIfNeed,
    fetchPendingParcelListIfNeed,
    sendSignedParcel,
    sendTransactionByParcel
};
