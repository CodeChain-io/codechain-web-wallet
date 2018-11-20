import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Action, ActionType } from "./actions";

export interface AssetState {
    assetScheme: { [assetType: string]: AssetSchemeDoc };
}

const initialState: AssetState = {
    assetScheme: {}
};

export const assetReducer = (state = initialState, action: Action) => {
    switch (action.type) {
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
