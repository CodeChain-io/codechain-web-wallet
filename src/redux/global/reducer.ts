import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Action, ActionType } from "./actions";

export interface GlobalState {
    isAuthenticated: boolean;
    assetScheme: { [assetType: string]: AssetSchemeDoc };
}

const initialState: GlobalState = {
    isAuthenticated: false,
    assetScheme: {}
};

export const globalReducer = (state = initialState, action: Action) => {
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
