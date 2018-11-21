import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { AssetTransferTransaction } from "codechain-sdk/lib/core/classes";
import { Action, ActionType } from "./transactionActions";

export interface TransactionState {
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
    sendingTx: {
        [address: string]: AssetTransferTransaction | null;
    };
}

const initialState: TransactionState = {
    pendingTxList: {},
    unconfirmedTxList: {},
    sendingTx: {}
};

export const transactionReducer = (state = initialState, action: Action) => {
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
    }
    return state;
};
