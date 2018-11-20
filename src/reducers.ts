import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Action, ActionType } from "./actions";
import { WalletAddress } from "./model/address";

export interface IRootState {
    isAuthenticated: boolean;
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
    walletName?: string;
    assetScheme: { [assetType: string]: AssetSchemeDoc };
}

const initialState: IRootState = {
    isAuthenticated: false,
    platformAddresses: [],
    assetAddresses: [],
    walletName: undefined,
    assetScheme: {}
};

export const appReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case ActionType.Login:
            return {
                ...state,
                isAuthenticated: true
            };
        case ActionType.Logout:
            return {
                ...state,
                isAuthenticated: false
            };
        case ActionType.UpdateWalletAddresses:
            return {
                ...state,
                platformAddresses: action.data.platformAddresses,
                assetAddresses: action.data.assetAddresses
            };
        case ActionType.UpdateWalletName:
            return {
                ...state,
                walletName: action.data
            };
        case ActionType.CacheAssetScheme:
            const assetType = action.data.assetType;
            const assetScheme = {
                ...state.assetScheme,
                [assetType]: action.data.assetScheme
            };
            return {
                ...state,
                assetScheme
            };
    }
    return state;
};
