import { U64 } from "codechain-sdk/lib/core/classes";
import { PlatformAccount } from "../../model/address";
import { Action, ActionType } from "./accountActions";

export interface AccountState {
    availableQuark: {
        [address: string]: U64 | null | undefined;
    };
    accounts: {
        [address: string]: {
            data?: PlatformAccount | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
}

export const accountInitState: AccountState = {
    availableQuark: {},
    accounts: {}
};

export const accountReducer = (state = accountInitState, action: Action) => {
    switch (action.type) {
        case ActionType.UpdateAvailableQuark: {
            const address = action.data.address;
            const availableQuark = {
                ...state.availableQuark,
                [address]: action.data.amount
            };
            return {
                ...state,
                availableQuark
            };
        }
        case ActionType.SetFetchingAccount: {
            const accounts = {
                ...state.accounts,
                [action.data.address]: {
                    ...state.accounts[action.data.address],
                    isFetching: true
                }
            };
            return {
                ...state,
                accounts
            };
        }
        case ActionType.UpdateAccount: {
            const accounts = {
                ...state.accounts,
                [action.data.address]: {
                    data: action.data.account,
                    isFetching: false,
                    updatedAt: +new Date()
                }
            };
            return {
                ...state,
                accounts
            };
        }
    }
    return state;
};
