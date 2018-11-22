import { PlatformAccount, WalletAddress } from "../../model/address";
import { Action, ActionType } from "./walletActions";

export interface WalletState {
    platformAddresses?: WalletAddress[] | null;
    assetAddresses?: WalletAddress[] | null;
    walletName?: string | null;
    accounts: {
        [address: string]: {
            data?: PlatformAccount | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
}

export const walletInitState: WalletState = {
    platformAddresses: undefined,
    assetAddresses: undefined,
    walletName: undefined,
    accounts: {}
};

export const walletReducer = (state = walletInitState, action: Action) => {
    switch (action.type) {
        case ActionType.UpdateWalletAssetAddresses:
            return {
                ...state,
                assetAddresses: action.data.assetAddresses
            };
        case ActionType.UpdateWalletPlatformAddresses:
            return {
                ...state,
                platformAddresses: action.data.platformAddresses
            };
        case ActionType.UpdateWalletName:
            return {
                ...state,
                walletName: action.data
            };
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
