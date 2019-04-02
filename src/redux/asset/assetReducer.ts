import { AggsUTXODoc, AssetSchemeDoc, UTXODoc } from "codechain-indexer-types";
import { H160, U64 } from "codechain-sdk/lib/core/classes";
import { Action, ActionType } from "./assetActions";

export interface AssetState {
    assetScheme: {
        [assetType: string]: {
            data?: AssetSchemeDoc;
            isFetching: boolean;
        } | null;
    };
    aggsUTXOList: {
        [address: string]: {
            data?: AggsUTXODoc[] | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
    UTXOList: {
        [id: string]: {
            data?: UTXODoc[] | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
    availableAssets: {
        [address: string]:
            | {
                  assetType: string;
                  quantities: U64;
              }[]
            | null;
    };
}

export const assetInitState: AssetState = {
    assetScheme: {},
    aggsUTXOList: {},
    UTXOList: {},
    availableAssets: {}
};

export const getIdForCacheUTXO = (address: string, assetType: H160) => {
    return `${address}-${assetType.value}`;
};

export const assetReducer = (state = assetInitState, action: Action) => {
    switch (action.type) {
        case ActionType.CacheAssetScheme: {
            const assetType = action.data.assetType;
            const currentAssetScheme = {
                data: action.data.assetScheme,
                isFetching: false
            };
            const assetScheme = {
                ...state.assetScheme,
                [assetType]: currentAssetScheme
            };
            return {
                ...state,
                assetScheme
            };
        }
        case ActionType.SetFetchingAssetScheme: {
            const assetType = action.data.assetType;
            const currentAssetScheme = {
                ...state.assetScheme[assetType],
                isFetching: true
            };
            const assetScheme = {
                ...state.assetScheme,
                [assetType]: currentAssetScheme
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
        case ActionType.CacheUTXOList: {
            const address = action.data.address;
            const assetType = action.data.assetType;
            const id = getIdForCacheUTXO(address, assetType);
            const currentUTXO = {
                data: action.data.UTXOList,
                updatedAt: +new Date(),
                isFetching: false
            };
            const UTXOList = {
                ...state.UTXOList,
                [id]: currentUTXO
            };
            return {
                ...state,
                UTXOList
            };
        }
        case ActionType.SetFetchingUTXOList: {
            const address = action.data.address;
            const assetType = action.data.assetType;
            const id = getIdForCacheUTXO(address, assetType);
            const currentUTXO = {
                ...state.UTXOList[id],
                isFetching: true
            };
            const UTXOList = {
                ...state.UTXOList,
                [id]: currentUTXO
            };
            return {
                ...state,
                UTXOList
            };
        }
        case ActionType.CacheAvailableAssets: {
            const address = action.data.address;
            const availableAssets = {
                ...state.availableAssets,
                [address]: action.data.availableAssets
            };
            return {
                ...state,
                availableAssets
            };
        }
    }
    return state;
};
