import { Action, ActionType } from "./exchangeActions";

export interface ExchangeState {
    exchangeHistory: {
        [currency: string]: {
            [address: string]: {
                data?:
                    | {
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
                      }[]
                    | null;
                isFetching: boolean;
                updatedAt?: number | null;
            };
        };
    };
    exchangeAddress: {
        [currency: string]: {
            [address: string]: {
                data?: string | null;
                isFetching: boolean;
                updatedAt?: number | null;
            };
        };
    };
    exchangeRate: {
        [currency: string]: {
            data?: number | null;
            isFetching: boolean;
            updatedAt?: number | null;
        };
    };
}

export const exchangeInitState: ExchangeState = {
    exchangeHistory: {},
    exchangeAddress: {},
    exchangeRate: {}
};

export const exchangeReducer = (state = exchangeInitState, action: Action) => {
    switch (action.type) {
        case ActionType.CacheExchangeAddress: {
            return {
                ...state,
                exchangeAddress: {
                    [action.data.currency]: {
                        ...state.exchangeAddress[action.data.currency],
                        [action.data.address]: {
                            isFetching: false,
                            data: action.data.btcAddress,
                            updatedAt: +new Date()
                        }
                    }
                }
            };
        }
        case ActionType.CacheExchangeRate: {
            return {
                ...state,
                exchangeRate: {
                    [action.data.currency]: {
                        isFetching: false,
                        data: action.data.rate,
                        updatedAt: +new Date()
                    }
                }
            };
        }
        case ActionType.CacheExchangeHistory: {
            return {
                ...state,
                exchangeHistory: {
                    [action.data.currency]: {
                        ...state.exchangeHistory[action.data.currency],
                        [action.data.address]: {
                            isFetching: false,
                            data: action.data.history,
                            updatedAt: +new Date()
                        }
                    }
                }
            };
        }
        case ActionType.SetFetchingExchangeAddress: {
            return {
                ...state,
                exchangeAddress: {
                    [action.data.currency]: {
                        ...state.exchangeAddress[action.data.currency],
                        [action.data.address]: {
                            ...(state.exchangeAddress[action.data.currency] ||
                                {})[action.data.address],
                            isFetching: true
                        }
                    }
                }
            };
        }
        case ActionType.SetFetchingExchangeRate: {
            return {
                ...state,
                exchangeRate: {
                    ...state.exchangeRate,
                    [action.data.currency]: {
                        ...state.exchangeRate[action.data.currency],
                        isFetching: true
                    }
                }
            };
        }
        case ActionType.SetFetchingExchangeHistory: {
            return {
                ...state,
                exchangeHistory: {
                    [action.data.currency]: {
                        ...state.exchangeHistory[action.data.currency],
                        [action.data.address]: {
                            ...(state.exchangeHistory[action.data.currency] ||
                                {})[action.data.address],
                            isFetching: true
                        }
                    }
                }
            };
        }
    }
    return state;
};
