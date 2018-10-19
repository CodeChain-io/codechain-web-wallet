import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Action } from "./actions";
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
        case "Login":
            return {
                ...state,
                isAuthenticated: true
            };
        case "Logout":
            return {
                ...state,
                isAuthenticated: false
            };
        case "UpdateWalletAddresses":
            return {
                ...state,
                platformAddresses: action.data.platformAddresses,
                assetAddresses: action.data.assetAddresses
            };
        case "UpdateWalletName":
            return {
                ...state,
                walletName: action.data
            };
        case "CacheAssetScheme":
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
