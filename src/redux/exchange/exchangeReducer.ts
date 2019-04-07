import { Action, ActionType } from "./exchangeActions";

export interface ExchangeState {
    exchangeHistory: {
        [address: string]: {
            data?:
                | {
                      received: {
                          hash: string;
                          quantity: string;
                          status: "success" | "pending" | "reverted";
                      };
                      sent: {
                          hash?: string;
                          quantity: string;
                          status: "success" | "pending";
                      };
                  }[]
                | null;
            isFetching: boolean;
            updatedAt?: number | null;
        };
    };
    btcAddress: {
        [address: string]: {
            data?: string | null;
            isFetching: boolean;
            updatedAt?: number | null;
        };
    };
    btcToCCCRate?: {
        data?: number | null;
        isFetching: boolean;
        updatedAt?: number | null;
    } | null;
}

export const exchangeInitState: ExchangeState = {
    exchangeHistory: {},
    btcAddress: {},
    btcToCCCRate: undefined
};

export const exchangeReducer = (state = exchangeInitState, action: Action) => {
    switch (action.type) {
        case ActionType.CacheBTCAddress: {
            return {
                ...state,
                btcAddress: {
                    [action.data.address]: {
                        isFetching: false,
                        data: action.data.btcAddress,
                        updatedAt: +new Date()
                    }
                }
            };
        }
        case ActionType.CacheBTCToCCCRate: {
            return {
                ...state,
                btcToCCCRate: {
                    isFetching: false,
                    data: action.data.rate,
                    updatedAt: +new Date()
                }
            };
        }
        case ActionType.CacheExchangeHistory: {
            return {
                ...state,
                exchangeHistory: {
                    [action.data.address]: {
                        isFetching: false,
                        data: action.data.history,
                        updatedAt: +new Date()
                    }
                }
            };
        }
        case ActionType.SetFetchingBTCAddress: {
            return {
                ...state,
                btcAddress: {
                    [action.data.address]: {
                        ...state.btcAddress[action.data.address],
                        isFetching: true
                    }
                }
            };
        }
        case ActionType.SetFetchingBTCToCCCRate: {
            return {
                ...state,
                btcToCCCRate: {
                    ...state.btcToCCCRate,
                    isFetching: true
                }
            };
        }
        case ActionType.SetFetchingExchangeHistory: {
            return {
                ...state,
                exchangeHistory: {
                    [action.data.address]: {
                        ...state.exchangeHistory[action.data.address],
                        isFetching: true
                    }
                }
            };
        }
    }
    return state;
};
