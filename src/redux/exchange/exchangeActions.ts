import { hideLoading, showLoading } from "react-redux-loading-bar";
import { Action as ReduxAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { createBTCAddress } from "../../networks/Api";

export type Action =
    | CacheBTCAddress
    | CacheExchangeHistory
    | CacheBTCToCCCRate
    | SetFetchingBTCAddress
    | SetFetchingBTCToCCCRate
    | SetFetchingExchangeHistory;

export enum ActionType {
    CacheBTCAddress = "CacheBTCAddress",
    CacheExchangeHistory = "CacheExchangeHistory",
    CacheBTCToCCCRate = "CacheBTCToCCCRate",
    SetFetchingBTCAddress = "SetFetchingBTCAddress",
    SetFetchingBTCToCCCRate = "SetFetchingBTCToCCCRate",
    SetFetchingExchangeHistory = "SetFetchingExchangeHistory"
}

export interface CacheBTCAddress {
    type: ActionType.CacheBTCAddress;
    data: {
        address: string;
        btcAddress: string;
    };
}

export interface CacheExchangeHistory {
    type: ActionType.CacheExchangeHistory;
    data: {
        address: string;
        history: {
            received: {
                hash: string;
                quantity: string;
                status: "success" | "pending" | "reverted";
            };
            sent?: {
                hash: string;
                quantity: string;
                status: "success" | "pending";
            };
        }[];
    };
}

export interface CacheBTCToCCCRate {
    type: ActionType.CacheBTCToCCCRate;
    data: {
        rate: number;
    };
}

export interface SetFetchingBTCAddress {
    type: ActionType.SetFetchingBTCAddress;
    data: {
        address: string;
    };
}

export interface SetFetchingBTCToCCCRate {
    type: ActionType.SetFetchingBTCToCCCRate;
}

export interface SetFetchingExchangeHistory {
    type: ActionType.SetFetchingExchangeHistory;
    data: {
        address: string;
    };
}

const setFetchingBTCAddress = (address: string): SetFetchingBTCAddress => ({
    type: ActionType.SetFetchingBTCAddress,
    data: {
        address
    }
});

/*
const setFetchingBTCToCCCRate = (): SetFetchingBTCToCCCRate => ({
    type: ActionType.SetFetchingBTCToCCCRate
});

const setFetchingExchangeHistory = (
    address: string
): SetFetchingExchangeHistory => ({
    type: ActionType.SetFetchingExchangeHistory,
    data: {
        address
    }
});*/

const cacheBTCAddress = (
    address: string,
    btcAddress: string
): CacheBTCAddress => ({
    type: ActionType.CacheBTCAddress,
    data: {
        address,
        btcAddress
    }
});

export const fetchBTCAddressIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, ReduxAction>,
        getState: () => ReducerConfigure
    ) => {
        const cachedBTCAddress = getState().exchangeReducer.btcAddress[address];
        if (cachedBTCAddress && cachedBTCAddress.isFetching) {
            return;
        }
        if (
            cachedBTCAddress &&
            cachedBTCAddress.updatedAt &&
            +new Date() - cachedBTCAddress.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading());
            dispatch(setFetchingBTCAddress(address));
            const btcAddress = await createBTCAddress(address);
            dispatch(cacheBTCAddress(address, btcAddress.address));
            dispatch(hideLoading());
        } catch (e) {
            console.log(e);
        }
    };
};
