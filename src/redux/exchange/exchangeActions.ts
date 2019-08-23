import { hideLoading, showLoading } from "react-redux-loading-bar";
import { Action as ReduxAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    createBTCAddress,
    getBTCtoCCCRate,
    getExchangeHistory
} from "../../networks/Api";

export type Action =
    | CacheExchangeAddress
    | CacheExchangeHistory
    | CacheExchangeRate
    | SetFetchingExchangeAddress
    | SetFetchingExchangeRate
    | SetFetchingExchangeHistory;

export enum ActionType {
    CacheExchangeAddress = "CacheExchangeAddress",
    CacheExchangeHistory = "CacheExchangeHistory",
    CacheExchangeRate = "CacheExchangeRate",
    SetFetchingExchangeAddress = "SetFetchingExchangeAddress",
    SetFetchingExchangeRate = "SetFetchingExchangeRate",
    SetFetchingExchangeHistory = "SetFetchingExchangeHistory"
}

export interface CacheExchangeAddress {
    type: ActionType.CacheExchangeAddress;
    data: {
        currency: "btc" | "eth";
        address: string;
        btcAddress: string;
    };
}

export interface CacheExchangeHistory {
    type: ActionType.CacheExchangeHistory;
    data: {
        currency: "btc" | "eth";
        address: string;
        history: {
            received: {
                hash: string;
                quantity: string;
                status: "success" | "pending" | "reverted";
                confirm: number;
            };
            sent: {
                hash?: string;
                quantity: string;
                status: "success" | "pending";
            };
        }[];
    };
}

export interface CacheExchangeRate {
    type: ActionType.CacheExchangeRate;
    data: {
        currency: "btc" | "eth";
        rate: number;
    };
}

export interface SetFetchingExchangeAddress {
    type: ActionType.SetFetchingExchangeAddress;
    data: {
        currency: "btc" | "eth";
        address: string;
    };
}

export interface SetFetchingExchangeRate {
    type: ActionType.SetFetchingExchangeRate;
    data: {
        currency: "btc" | "eth";
    };
}

export interface SetFetchingExchangeHistory {
    type: ActionType.SetFetchingExchangeHistory;
    data: {
        currency: "btc" | "eth";
        address: string;
    };
}

const setFetchingExchangeAddress = (
    address: string,
    currency: "btc" | "eth"
): SetFetchingExchangeAddress => ({
    type: ActionType.SetFetchingExchangeAddress,
    data: {
        currency,
        address
    }
});

const setFetchingExchangeRate = (
    currency: "btc" | "eth"
): SetFetchingExchangeRate => ({
    type: ActionType.SetFetchingExchangeRate,
    data: {
        currency
    }
});

const setFetchingExchangeHistory = (
    address: string,
    currency: "btc" | "eth"
): SetFetchingExchangeHistory => ({
    type: ActionType.SetFetchingExchangeHistory,
    data: {
        currency,
        address
    }
});

const cacheExchangeAddress = (
    address: string,
    btcAddress: string,
    currency: "btc" | "eth"
): CacheExchangeAddress => ({
    type: ActionType.CacheExchangeAddress,
    data: {
        currency,
        address,
        btcAddress
    }
});

const cacheExchangeRate = (
    rate: number,
    currency: "btc" | "eth"
): CacheExchangeRate => ({
    type: ActionType.CacheExchangeRate,
    data: {
        rate,
        currency
    }
});

const cacheExchangeHistory = (
    address: string,
    history: {
        received: {
            hash: string;
            quantity: string;
            status: "success" | "pending" | "reverted";
            confirm: number;
        };
        sent: {
            hash?: string;
            quantity: string;
            status: "success" | "pending";
        };
    }[],
    currency: "btc" | "eth"
): CacheExchangeHistory => ({
    type: ActionType.CacheExchangeHistory,
    data: {
        address,
        history,
        currency
    }
});

export const fetchExchangeAddressIfNeed = (
    address: string,
    currency: "btc" | "eth"
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, ReduxAction>,
        getState: () => ReducerConfigure
    ) => {
        const cachedBTCAddress = (getState().exchangeReducer.exchangeAddress[
            currency
        ] || {})[address];
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
            dispatch(setFetchingExchangeAddress(address, currency));
            const btcAddress = await createBTCAddress(address, currency);
            dispatch(
                cacheExchangeAddress(address, btcAddress.address, currency)
            );
            dispatch(hideLoading());
        } catch (e) {
            console.log(e);
        }
    };
};

export const fetchExchangeRateIfNeed = (currency: "btc" | "eth") => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, ReduxAction>,
        getState: () => ReducerConfigure
    ) => {
        const exchangeRate = getState().exchangeReducer.exchangeRate[currency];
        if (exchangeRate && exchangeRate.isFetching) {
            return;
        }
        if (
            exchangeRate &&
            exchangeRate.updatedAt &&
            +new Date() - exchangeRate.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading());
            dispatch(setFetchingExchangeRate(currency));
            const response = await getBTCtoCCCRate(currency);
            dispatch(cacheExchangeRate(response.toCCC, currency));
            dispatch(hideLoading());
        } catch (e) {
            console.log(e);
        }
    };
};

export const fetchExchangeHistoryIfNeed = (
    address: string,
    currency: "btc" | "eth"
) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, ReduxAction>,
        getState: () => ReducerConfigure
    ) => {
        const exchangeHistory = (getState().exchangeReducer.exchangeHistory[
            currency
        ] || {})[address];
        if (exchangeHistory && exchangeHistory.isFetching) {
            return;
        }
        if (
            exchangeHistory &&
            exchangeHistory.updatedAt &&
            +new Date() - exchangeHistory.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(showLoading());
            dispatch(setFetchingExchangeHistory(address, currency));
            const response = await getExchangeHistory(address, currency);
            dispatch(cacheExchangeHistory(address, response, currency));
            dispatch(hideLoading());
        } catch (e) {
            console.log(e);
        }
    };
};
