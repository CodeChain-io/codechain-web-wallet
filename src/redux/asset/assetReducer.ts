import {
    AggsUTXO,
    AssetSchemeDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import { MetadataFormat } from "codechain-indexer-types/lib/utils";
import { Action, ActionType } from "./assetActions";
const merge = require("deepmerge").default;

export interface AssetState {
    assetScheme: {
        [assetType: string]: {
            data?: AssetSchemeDoc;
            isFetching: boolean;
        } | null;
    };
    aggsUTXOList: {
        [address: string]: {
            data?: AggsUTXO[] | null;
            updatedAt?: number | null;
            isFetching: boolean;
        } | null;
    };
    UTXOList: {
        [address: string]: {
            [assetType: string]: {
                data?: UTXO[] | null;
                updatedAt?: number | null;
                isFetching: boolean;
            } | null;
        } | null;
    };
    availableAssets: {
        [address: string]:
            | {
                  assetType: string;
                  quantities: number;
                  metadata: MetadataFormat;
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
            const newUTXOList = {
                [address]: {
                    [assetType]: {
                        data: action.data.UTXOList,
                        updatedAt: +new Date(),
                        isFetching: false
                    }
                }
            };
            return {
                ...state,
                UTXOList: merge(state.UTXOList, newUTXOList)
            };
        }
        case ActionType.SetFetchingUTXOList: {
            const address = action.data.address;
            const assetType = action.data.assetType;
            const newUTXOList = {
                [address]: {
                    [assetType]: {
                        isFetching: true
                    }
                }
            };
            return {
                ...state,
                UTXOList: merge(state.UTXOList, newUTXOList)
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
