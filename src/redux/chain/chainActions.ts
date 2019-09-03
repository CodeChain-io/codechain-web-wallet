import { TransactionDoc } from "codechain-indexer-types";
import { SDK } from "codechain-sdk";
import {
    H160,
    SignedTransaction,
    Transaction
} from "codechain-sdk/lib/core/classes";
import _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { isAssetAddress, isPlatformAddress } from "../../model/address";
import {
    getCountOfTxByAddress,
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
    | SetFetchingCountOfTxList
    | SetFetchingCountOfTxListById
    | CacheCountOfTxList
    | CacheCountOfTxListById;

export enum ActionType {
    CachePendingTxList = "CachePendingTxList",
    CacheTxList = "CacheTxList",
    SetFetchingPendingTxList = "SetFetchingPendingTxList",
    UpdateBestBlockNumber = "UpdateBestBlockNumber",
    SetFetchingBestBlockNumber = "SetFetchingBestBlockNumber",
    SetFetchingTxList = "SetFetchingTxList",
    SetFetchingTxListById = "SetFetchingTxListById",
    CacheTxListById = "CacheTxListById",
    SetFetchingCountOfTxList = "SetFetchingCountOfTxList",
    SetFetchingCountOfTxListById = "SetFetchingCountOfTxListById",
    CacheCountOfTxList = "CacheCountOfTxList",
    CacheCountOfTxListById = "CacheCountOfTxListById"
}

export interface SetFetchingTxListById {
    type: ActionType.SetFetchingTxListById;
    data: {
        address: string;
        assetType: H160;
    };
}

export interface CacheTxListById {
    type: ActionType.CacheTxListById;
    data: {
        address: string;
        assetType: H160;
        txList: TransactionDoc[];
    };
}

export interface CachePendingTxList {
    type: ActionType.CachePendingTxList;
    data: {
        address: string;
        pendingTxList: TransactionDoc[];
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

export interface SetFetchingCountOfTxList {
    type: ActionType.SetFetchingCountOfTxList;
    data: {
        address: string;
    };
}

export interface SetFetchingCountOfTxListById {
    type: ActionType.SetFetchingCountOfTxListById;
    data: {
        address: string;
        assetType: H160;
    };
}

export interface CacheCountOfTxList {
    type: ActionType.CacheCountOfTxList;
    data: {
        address: string;
        count: number;
    };
}

export interface CacheCountOfTxListById {
    type: ActionType.CacheCountOfTxListById;
    data: {
        address: string;
        assetType: H160;
        count: number;
    };
}

const cacheCountOfTxList = (
    address: string,
    count: number
): CacheCountOfTxList => ({
    type: ActionType.CacheCountOfTxList,
    data: {
        address,
        count
    }
});

const cacheCountOfTxListById = (
    address: string,
    assetType: H160,
    count: number
): CacheCountOfTxListById => ({
    type: ActionType.CacheCountOfTxListById,
    data: {
        address,
        assetType,
        count
    }
});

const setFetchingCountOfTxList = (
    address: string
): SetFetchingCountOfTxList => ({
    type: ActionType.SetFetchingCountOfTxList,
    data: {
        address
    }
});

const setFetchingCountOfTxListById = (
    address: string,
    assetType: H160
): SetFetchingCountOfTxListById => ({
    type: ActionType.SetFetchingCountOfTxListById,
    data: {
        address,
        assetType
    }
});

const cachePendingTxList = (
    address: string,
    pendingTxList: TransactionDoc[]
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
                if (isAssetAddress(address)) {
                    dispatch(assetActions.calculateAvailableAssets(address));
                } else if (isPlatformAddress(address)) {
                    dispatch(accountActions.calculateAvailableQuark(address));
                }
            }, 300);
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchTxListIfNeed = (
    address: string,
    params?: { page?: number; itemsPerPage?: number; force: boolean }
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const { page = 1, itemsPerPage = 10, force = false } = params || {};
        const cachedTxList = getState().chainReducer.txList[address];
        if (!force && cachedTxList && cachedTxList.isFetching) {
            return;
        }
        if (
            !force &&
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
            const txList = await getTxsByAddress(
                address,
                page,
                itemsPerPage,
                networkId
            );
            dispatch({
                type: ActionType.CacheTxList,
                data: {
                    address,
                    txList
                }
            });
            // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
            // This code is temporary for solving this problem.
            setTimeout(() => {
                if (isAssetAddress(address)) {
                    dispatch(assetActions.calculateAvailableAssets(address));
                } else if (isPlatformAddress(address)) {
                    dispatch(accountActions.calculateAvailableQuark(address));
                }
            }, 300);
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchCountOfTxListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedCountOfTxList = getState().chainReducer.countOfTxList[
            address
        ];
        if (cachedCountOfTxList && cachedCountOfTxList.isFetching) {
            return;
        }
        if (
            cachedCountOfTxList &&
            cachedCountOfTxList.updatedAt &&
            +new Date() - cachedCountOfTxList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setFetchingCountOfTxList(address));
            const networkId = getState().globalReducer.networkId;
            const txCount = await getCountOfTxByAddress({ address, networkId });
            dispatch(cacheCountOfTxList(address, txCount));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchCountOfTxListByAssetTypeIfNeed = (
    address: string,
    assetType: H160
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const id = getIdByAddressAssetType(address, assetType);
        const cachedCountOfTxListById = getState().chainReducer
            .countOfTxListById[id];
        if (cachedCountOfTxListById && cachedCountOfTxListById.isFetching) {
            return;
        }
        if (
            cachedCountOfTxListById &&
            cachedCountOfTxListById.updatedAt &&
            +new Date() - cachedCountOfTxListById.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading() as any);
            dispatch(setFetchingCountOfTxListById(address, assetType));
            const networkId = getState().globalReducer.networkId;
            const txCount = await getCountOfTxByAddress({
                address,
                networkId,
                assetType
            });
            dispatch(cacheCountOfTxListById(address, assetType, txCount));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

const sendSignedTransaction = (
    address: string,
    signedTransaction: SignedTransaction,
    observePlatformAddress?: string | null
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
                await sdk.rpc.chain.sendSignedTransaction(signedTransaction);
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
                                tx => tx.hash === signedTransaction.hash().value
                            )) ||
                        (txList &&
                            txList.data &&
                            _.find(
                                txList.data,
                                tx => tx.hash === signedTransaction.hash().value
                            ))
                    ) {
                        if (isAssetAddress(address)) {
                            dispatch(
                                assetActions.fetchAvailableAssets(address)
                            );
                        } else if (isPlatformAddress(address)) {
                            dispatch(
                                accountActions.fetchAvailableQuark(address)
                            );
                        }
                        if (observePlatformAddress) {
                            dispatch(
                                accountActions.fetchAvailableQuark(
                                    observePlatformAddress
                                )
                            );
                        }
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
    assetAddress: string,
    transaction: Transaction,
    gatewayURL: string
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        return new Promise(async (resolve, reject) => {
            try {
                await sendTxToGateway(transaction, gatewayURL);
                checkingIndexingFuncForSendingTx = setInterval(() => {
                    dispatch(fetchPendingTxListIfNeed(assetAddress));
                    dispatch(fetchTxListIfNeed(assetAddress));
                    const pendingTxList = getState().chainReducer.pendingTxList[
                        assetAddress
                    ];
                    const txList = getState().chainReducer.txList[assetAddress];
                    if (
                        (pendingTxList &&
                            pendingTxList.data &&
                            _.find(
                                pendingTxList.data,
                                tx =>
                                    tx.hash === transaction.unsignedHash().value
                            )) ||
                        (txList &&
                            txList.data &&
                            _.find(
                                txList.data,
                                tx =>
                                    tx.hash === transaction.unsignedHash().value
                            ))
                    ) {
                        dispatch(
                            assetActions.fetchAvailableAssets(assetAddress)
                        );
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

const fetchTxListByAssetTypeIfNeed = (
    address: string,
    assetType: H160,
    params?: { page?: number; itemsPerPage?: number; force: boolean }
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const { page = 1, itemsPerPage = 10, force = false } = params || {};
        const id = getIdByAddressAssetType(address, assetType);
        const cachedTxListById = getState().chainReducer.txListById[id];
        if (!force && cachedTxListById && cachedTxListById.isFetching) {
            return;
        }
        if (
            !force &&
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
            const txList = await getTxsByAddress(
                address,
                page,
                itemsPerPage,
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

export default {
    fetchPendingTxListIfNeed,
    fetchTxListIfNeed,
    fetchTxListByAssetTypeIfNeed,
    sendSignedTransaction,
    sendTransactionByGateway,
    fetchCountOfTxListByAssetTypeIfNeed,
    fetchCountOfTxListIfNeed
};
