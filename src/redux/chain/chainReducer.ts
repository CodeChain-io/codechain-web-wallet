import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";
import { Action, ActionType } from "./chainActions";

export interface ChainState {
    pendingTxList: {
        [address: string]: {
            data?: PendingTransactionDoc[] | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    unconfirmedTxList: {
        [address: string]: {
            data?: TransactionDoc[] | null;
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
    sendingTx: {
        [address: string]: AssetTransferTransaction | null;
    };
    bestBlockNumber?: {
        data?: number | null;
        isFetching: boolean;
        updatedAt?: number | null;
    } | null;
}

export const chainInitState: ChainState = {
    pendingTxList: {},
    unconfirmedTxList: {},
    txList: {},
    sendingTx: {},
    bestBlockNumber: undefined
};

export const chainReducer = (state = chainInitState, action: Action) => {
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
        case ActionType.CacheUnconfirmedTxList: {
            const address = action.data.address;
            const currentUnconfirmedTxList = {
                data: action.data.unconfirmedTxList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const unconfirmedTxList = {
                ...state.unconfirmedTxList,
                [address]: currentUnconfirmedTxList
            };
            return {
                ...state,
                unconfirmedTxList
            };
        }
        case ActionType.SetFetchingUnconfirmedTxList: {
            const address = action.data.address;
            const currentUnconfirmedTxList = {
                ...state.unconfirmedTxList[address],
                isFetching: true
            };
            const unconfirmedTxList = {
                ...state.unconfirmedTxList,
                [address]: currentUnconfirmedTxList
            };
            return {
                ...state,
                unconfirmedTxList
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
    }
    return state;
};
