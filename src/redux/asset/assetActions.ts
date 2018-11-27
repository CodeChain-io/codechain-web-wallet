import {
    AggsUTXO,
    AssetSchemeDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getAggsUTXOList,
    getAssetByAssetType,
    getUTXOListByAssetType
} from "../../networks/Api";
import { TxUtil } from "../../utils/transaction";
import chainActions from "../chain/chainActions";

export type Action =
    | CacheAssetScheme
    | CacheAggsUTXOList
    | SetFetchingAggsUTXOList
    | SetFetchingAssetScheme
    | CacheUTXOList
    | SetFetchingUTXOList
    | CacheAvailableAssets;

export enum ActionType {
    CacheAssetScheme = 0,
    CacheAggsUTXOList,
    SetFetchingAggsUTXOList,
    SetFetchingAssetScheme,
    SetFetchingUTXOList,
    CacheUTXOList,
    CacheAvailableAssets
}

export interface CacheAssetScheme {
    type: ActionType.CacheAssetScheme;
    data: {
        assetType: string;
        assetScheme: AssetSchemeDoc;
    };
}

export interface CacheAggsUTXOList {
    type: ActionType.CacheAggsUTXOList;
    data: {
        address: string;
        aggsUTXOList: AggsUTXO[];
    };
}

export interface SetFetchingAggsUTXOList {
    type: ActionType.SetFetchingAggsUTXOList;
    data: {
        address: string;
    };
}

export interface SetFetchingAssetScheme {
    type: ActionType.SetFetchingAssetScheme;
    data: {
        assetType: string;
    };
}

export interface SetFetchingUTXOList {
    type: ActionType.SetFetchingUTXOList;
    data: {
        address: string;
        assetType: string;
    };
}

export interface CacheUTXOList {
    type: ActionType.CacheUTXOList;
    data: {
        address: string;
        assetType: string;
        UTXOList: UTXO[];
    };
}

export interface CacheAvailableAssets {
    type: ActionType.CacheAvailableAssets;
    data: {
        address: string;
        availableAssets: {
            assetType: string;
            quantities: number;
            metadata: MetadataFormat;
        }[];
    };
}

const cacheAssetScheme = (
    assetType: H256,
    assetScheme: AssetSchemeDoc
): CacheAssetScheme => ({
    type: ActionType.CacheAssetScheme,
    data: {
        assetType: assetType.value,
        assetScheme
    }
});

const cacheAggsUTXOList = (
    address: string,
    aggsUTXOList: AggsUTXO[]
): CacheAggsUTXOList => ({
    type: ActionType.CacheAggsUTXOList,
    data: {
        address,
        aggsUTXOList
    }
});

const cacheUTXOList = (
    address: string,
    assetType: H256,
    UTXOList: UTXO[]
): CacheUTXOList => ({
    type: ActionType.CacheUTXOList,
    data: {
        address,
        assetType: assetType.value,
        UTXOList
    }
});

const cacheAvailableAssets = (
    address: string,
    availableAssets: {
        assetType: string;
        quantities: number;
        metadata: MetadataFormat;
    }[]
): CacheAvailableAssets => ({
    type: ActionType.CacheAvailableAssets,
    data: {
        address,
        availableAssets
    }
});

const setFetchingAssetScheme = (assetType: H256): SetFetchingAssetScheme => ({
    type: ActionType.SetFetchingAssetScheme,
    data: {
        assetType: assetType.value
    }
});

const setFetchingAggsUTXOList = (address: string): SetFetchingAggsUTXOList => ({
    type: ActionType.SetFetchingAggsUTXOList,
    data: {
        address
    }
});

const setFetchingUTXOList = (
    address: string,
    assetType: H256
): SetFetchingUTXOList => ({
    type: ActionType.SetFetchingUTXOList,
    data: {
        address,
        assetType: assetType.value
    }
});

const fetchAssetSchemeIfNeed = (assetType: H256) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedAssetScheme = getState().assetReducer.assetScheme[
            assetType.value
        ];
        if (cachedAssetScheme && cachedAssetScheme.isFetching) {
            return;
        }
        try {
            dispatch(setFetchingAssetScheme(assetType));
            const networkId = getState().globalReducer.networkId;
            const responseAssetScheme = await getAssetByAssetType(
                assetType,
                networkId
            );
            dispatch(cacheAssetScheme(assetType, responseAssetScheme));
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchAggsUTXOListIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedAggsUTXOList = getState().assetReducer.aggsUTXOList[
            address
        ];
        if (cachedAggsUTXOList && cachedAggsUTXOList.isFetching) {
            return;
        }
        if (
            cachedAggsUTXOList &&
            cachedAggsUTXOList.updatedAt &&
            +new Date() - cachedAggsUTXOList.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(setFetchingAggsUTXOList(address));
            const networkId = getState().globalReducer.networkId;
            const UTXOResponse = await getAggsUTXOList(address, networkId);
            dispatch(cacheAggsUTXOList(address, UTXOResponse));
            _.each(UTXOResponse, u => {
                dispatch(
                    cacheAssetScheme(new H256(u.assetType), u.assetScheme)
                );
            });
            dispatch(calculateAvailableAssets(address));
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchUTXOListIfNeed = (address: string, assetType: H256) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const UTXOListByAddress = getState().assetReducer.UTXOList[address];
        const cachedUTXOListByAddressAssetType =
            UTXOListByAddress && UTXOListByAddress[assetType.value];
        if (
            cachedUTXOListByAddressAssetType &&
            cachedUTXOListByAddressAssetType.isFetching
        ) {
            return;
        }
        if (
            cachedUTXOListByAddressAssetType &&
            cachedUTXOListByAddressAssetType.updatedAt &&
            +new Date() - cachedUTXOListByAddressAssetType.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(setFetchingUTXOList(address, assetType));
            const networkId = getState().globalReducer.networkId;
            const UTXOListResponse = await getUTXOListByAssetType(
                address,
                assetType,
                networkId
            );
            dispatch(cacheUTXOList(address, assetType, UTXOListResponse));
        } catch (e) {
            console.log(e);
        }
    };
};

const fetchAvailableAssets = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        dispatch(chainActions.fetchPendingTxListIfNeed(address));
        dispatch(chainActions.fetchUnconfirmedTxListIfNeed(address));
        dispatch(fetchAggsUTXOListIfNeed(address));
    };
};

const calculateAvailableAssets = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const unconfirmedTxListObj = getState().chainReducer.unconfirmedTxList[
            address
        ];
        const addressUTXOListObj = getState().assetReducer.aggsUTXOList[
            address
        ];
        const pendingTxListObj = getState().chainReducer.pendingTxList[address];

        const unconfirmedTxList =
            unconfirmedTxListObj && unconfirmedTxListObj.data;
        const addressUTXOList = addressUTXOListObj && addressUTXOListObj.data;
        const pendingTxList = pendingTxListObj && pendingTxListObj.data;

        if (!addressUTXOList || !pendingTxList || !unconfirmedTxList) {
            return;
        }

        const aggregatedUnconfirmedAsset = _.flatMap(
            unconfirmedTxList,
            unconfirmedTx => {
                return TxUtil.getAssetAggregationFromTransactionDoc(
                    address,
                    unconfirmedTx
                );
            }
        );

        const txHashList = _.map(unconfirmedTxList, tx => tx.data.hash);
        const validPendingTxList = _.filter(
            pendingTxList,
            pendingTx =>
                !_.includes(txHashList, pendingTx.transaction.data.hash)
        );
        const aggregatedPendingAsset = _.flatMap(
            validPendingTxList,
            pendingTx => {
                return TxUtil.getAssetAggregationFromTransactionDoc(
                    address,
                    pendingTx.transaction
                );
            }
        );

        const availableAssets: {
            [assetType: string]: {
                assetType: string;
                quantities: number;
                metadata: MetadataFormat;
            };
        } = {};
        _.each(addressUTXOList, addressConfirmedUTXO => {
            availableAssets[addressConfirmedUTXO.assetType] = {
                assetType: addressConfirmedUTXO.assetType,
                quantities: addressConfirmedUTXO.totalAssetQuantity,
                metadata: Type.getMetadata(
                    addressConfirmedUTXO.assetScheme.metadata
                )
            };
        });
        _.each(aggregatedUnconfirmedAsset, asset => {
            const quantities =
                asset.outputQuantities -
                (asset.inputQuantities + asset.burnQuantities);

            if (quantities > 0) {
                availableAssets[asset.assetType] = {
                    ...availableAssets[asset.assetType],
                    quantities:
                        availableAssets[asset.assetType].quantities - quantities
                };
            }
        });
        _.each(aggregatedPendingAsset, asset => {
            const quantities =
                asset.outputQuantities -
                (asset.inputQuantities + asset.burnQuantities);

            if (quantities < 0) {
                availableAssets[asset.assetType] = {
                    ...availableAssets[asset.assetType],
                    quantities:
                        availableAssets[asset.assetType].quantities + quantities
                };
            }
        });
        const availableAssetsValue = _.values(availableAssets);
        dispatch(cacheAvailableAssets(address, availableAssetsValue));
    };
};

export default {
    cacheAssetScheme,
    fetchAggsUTXOListIfNeed,
    fetchAssetSchemeIfNeed,
    fetchUTXOListIfNeed,
    calculateAvailableAssets,
    fetchAvailableAssets
};
