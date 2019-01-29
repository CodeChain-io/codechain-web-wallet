import {
    ParcelDoc,
    PendingParcelDoc,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import {
    AssetTransferTransaction,
    H256,
    SignedParcel
} from "codechain-sdk/lib/core/classes";
import { Action, ActionType } from "./chainActions";

export interface ChainState {
    pendingTxList: {
        [address: string]: {
            data?: PendingTransactionDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    txList: {
        [address: string]: {
            data?: TransactionDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    pendingTxListById: {
        [id: string]: {
            data?: PendingTransactionDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    txListById: {
        [id: string]: {
            data?: TransactionDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    sendingTx: {
        [address: string]: AssetTransferTransaction | null;
    };
    sendingSignedParcel: {
        [address: string]: SignedParcel | null;
    };
    bestBlockNumber?: {
        data?: number | null;
        isFetching: boolean;
        updatedAt?: number | null;
    } | null;
    parcelList: {
        [address: string]: {
            data?: ParcelDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    pendingParcelList: {
        [address: string]: {
            data?: PendingParcelDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
}

export const chainInitState: ChainState = {
    pendingTxList: {},
    txList: {},
    sendingTx: {},
    sendingSignedParcel: {},
    bestBlockNumber: undefined,
    txListById: {},
    pendingTxListById: {},
    parcelList: {},
    pendingParcelList: {}
};

export const getIdByAddressAssetType = (address: string, assetType: H256) => {
    return `${address}-${assetType.value}`;
};

export const chainReducer = (
    state = chainInitState,
    action: Action
): ChainState => {
    switch (action.type) {
        case ActionType.CachePendingTxList: {
            const address = action.data.address;
            const currentPendingTxList = {
                data: action.data.pendingTxList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const pendingTxList = {
                ...state.pendingTxList,
                [address]: currentPendingTxList
            };
            return {
                ...state,
                pendingTxList
            };
        }
        case ActionType.SetFetchingPendingTxList: {
            const address = action.data.address;
            const currentPendingTxList = {
                ...state.pendingTxList[address],
                isFetching: true
            };
            const pendingTxList = {
                ...state.pendingTxList,
                [address]: currentPendingTxList
            };
            return {
                ...state,
                pendingTxList
            };
        }
        case ActionType.SetSendingTx: {
            const address = action.data.address;
            const sendingTx = {
                ...state.sendingTx,
                [address]: action.data.tx
            };
            return {
                ...state,
                sendingTx
            };
        }
        case ActionType.SetSendingSignedParcel: {
            const address = action.data.address;
            const sendingSignedParcel = {
                ...state.sendingSignedParcel,
                [address]: action.data.signedParcel
            };
            return {
                ...state,
                sendingSignedParcel
            };
        }
        case ActionType.UpdateBestBlockNumber: {
            return {
                ...state,
                bestBlockNumber: {
                    data: action.data.bestBlockNumber,
                    updatedAt: +new Date(),
                    isFetching: false
                }
            };
        }
        case ActionType.SetFetchingBestBlockNumber: {
            return {
                ...state,
                bestBlockNumber: {
                    ...state.bestBlockNumber,
                    isFetching: true
                }
            };
        }
        case ActionType.CacheTxList: {
            const address = action.data.address;
            const currentTxList = {
                data: action.data.txList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const txList = {
                ...state.txList,
                [address]: currentTxList
            };
            return {
                ...state,
                txList
            };
        }
        case ActionType.SetFetchingTxList: {
            const address = action.data.address;
            const currentTxList = {
                ...state.txList[address],
                isFetching: true
            };
            const txList = {
                ...state.txList,
                [address]: currentTxList
            };
            return {
                ...state,
                txList
            };
        }
        case ActionType.SetFetchingTxListById: {
            const address = action.data.address;
            const assetType = action.data.assetType;
            const id = getIdByAddressAssetType(address, assetType);
            const currentTxList = {
                ...state.txListById[id],
                isFetching: true
            };
            const txListById = {
                ...state.txListById,
                [id]: currentTxList
            };
            return {
                ...state,
                txListById
            };
        }
        case ActionType.CacheTxListById: {
            const address = action.data.address;
            const assetType = action.data.assetType;
            const id = getIdByAddressAssetType(address, assetType);
            const currentTxList = {
                data: action.data.txList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const txListById = {
                ...state.txListById,
                [id]: currentTxList
            };
            return {
                ...state,
                txListById
            };
        }
        case ActionType.CacheParcelList: {
            const address = action.data.address;
            const currentParcelList = {
                data: action.data.parcelList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const parcelList = {
                ...state.parcelList,
                [address]: currentParcelList
            };
            return {
                ...state,
                parcelList
            };
        }
        case ActionType.CachePendingParcelList: {
            const address = action.data.address;
            const currentPendingParcelList = {
                data: action.data.pendingParcelList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const pendingParcelList = {
                ...state.pendingParcelList,
                [address]: currentPendingParcelList
            };
            return {
                ...state,
                pendingParcelList
            };
        }
        case ActionType.SetFetchingParcelList: {
            const address = action.data.address;
            const currentParcelList = {
                ...state.parcelList[address],
                isFetching: true
            };
            const parcelList = {
                ...state.parcelList,
                [address]: currentParcelList
            };
            return {
                ...state,
                parcelList
            };
        }
        case ActionType.SetFetchingPendingParcelList: {
            const address = action.data.address;
            const currentPendingParcelList = {
                ...state.pendingParcelList[address],
                isFetching: true
            };
            const pendingParcelList = {
                ...state.pendingParcelList,
                [address]: currentPendingParcelList
            };
            return {
                ...state,
                pendingParcelList
            };
        }
    }
    return state;
};
