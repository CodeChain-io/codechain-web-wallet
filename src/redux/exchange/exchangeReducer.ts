import { Action } from "./exchangeActions";

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
                      sent?: {
                          hash: string;
                          quantity: string;
                          status: "success" | "pending";
                      };
                  }[]
                | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
    };
    btcAddress: {
        [address: string]: {
            data?:
                | {
                      type: string;
                      address: string;
                      createdAt: Date;
                  }[]
                | null;
            isFetching: boolean;
            updatedAt?: number | null;
        } | null;
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
    }
    return state;
};
