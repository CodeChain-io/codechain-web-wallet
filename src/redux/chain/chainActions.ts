import { TransactionDoc } from "codechain-indexer-types";
import { SDK } from "codechain-sdk";
import {
    H160,
    SignedTransaction,
    Transaction
} from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { isAssetAddress, isPlatformAddress } from "../../model/address";
import {
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
    | CacheTxListById;

export enum ActionType {
    CachePendingTxList = "CachePendingTxList",
    CacheTxList = "CacheTxList",
    SetFetchingPendingTxList = "SetFetchingPendingTxList",
    UpdateBestBlockNumber = "UpdateBestBlockNumber",
    SetFetchingBestBlockNumber = "SetFetchingBestBlockNumber",
    SetFetchingTxList = "SetFetchingTxList",
    SetFetchingTxListById = "SetFetchingTxListById",
    CacheTxListById = "CacheTxListById"
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
            const txList = await getTxsByAddress(address, 1, 100, networkId);
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

const fetchTxListByAssetTypeIfNeed = (address: string, assetType: H160) => {
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
                100,
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
    sendTransactionByGateway
};
