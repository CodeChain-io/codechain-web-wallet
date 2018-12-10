import { WalletAddress } from "../../model/address";
import { Action, ActionType } from "./walletActions";

export interface WalletState {
    platformAddresses?: WalletAddress[] | null;
    assetAddresses?: WalletAddress[] | null;
    isLoadingPlatformAddresses?: boolean | null;
    isLoadingAssetAddresses?: boolean | null;
}

export const walletInitState: WalletState = {
    platformAddresses: undefined,
    assetAddresses: undefined,
    isLoadingPlatformAddresses: undefined,
    isLoadingAssetAddresses: undefined
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
        case ActionType.ClearWalletAddresses: {
            return {
                ...state,
                platformAddresses: undefined,
                assetAddresses: undefined
            };
        }
        case ActionType.SetLoadingAssetAddresses: {
            return {
                ...state,
                isLoadingAssetAddresses: action.data.isLoading
            };
        }
        case ActionType.SetLoadingPlatformAddresses: {
            return {
                ...state,
                isLoadingPlatformAddresses: action.data.isLoading
            };
        }
    }
    return state;
};
