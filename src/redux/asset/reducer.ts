import { AggsUTXO, AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Action, ActionType } from "./actions";

export interface AssetState {
    assetScheme: { [assetType: string]: AssetSchemeDoc | null };
    aggsUTXOList: {
        [address: string]: {
            data?: AggsUTXO[] | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
}

const initialState: AssetState = {
    assetScheme: {},
    aggsUTXOList: {}
};

export const assetReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case ActionType.CacheAssetScheme: {
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
        case ActionType.SetFetchingAggsUTXOList: {
            const address = action.data.address;
            const currentAggsUTXOList = {
                ...state.aggsUTXOList[address],
                isFetching: true
            };
            const aggsUTXOList = {
                ...state.aggsUTXOList,
                [address]: currentAggsUTXOList
            };
            return {
                ...state,
                aggsUTXOList
            };
        }
        case ActionType.CacheAggsUTXOList: {
            const address = action.data.address;
            const currentAggsUTXOList = {
                data: action.data.aggsUTXOList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const aggsUTXOList = {
                ...state.aggsUTXOList,
                [address]: currentAggsUTXOList
            };
            return {
                ...state,
                aggsUTXOList
            };
        }
    }
    return state;
};
