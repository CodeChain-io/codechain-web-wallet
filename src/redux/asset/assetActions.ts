import {
    AggsUTXO,
    AssetSchemeDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    getAggsUTXOList,
    getAssetByAssetType,
    getUTXOListByAssetType
} from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";

export type Action =
    | CacheAssetScheme
    | CacheAggsUTXOList
    | SetFetchingAggsUTXOList
    | SetFetchingAssetScheme
    | CacheUTXOList
    | SetFetchingUTXOList;

export enum ActionType {
    CacheAssetScheme = "cacheAssetScheme",
    CacheAggsUTXOList = "cacheAggsUTXOList",
    SetFetchingAggsUTXOList = "setFetchingAggsUTXOList",
    SetFetchingAssetScheme = "setFetchingAssetScheme",
    SetFetchingUTXOList = "setFetchingUTXOList",
    CacheUTXOList = "cacheUTXOList"
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

const fetchAssetSchemeIfNeed = (assetType: H256, networkId: string) => {
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
            +new Date() - cachedAggsUTXOList.updatedAt < 3
        ) {
            return;
        }
        try {
            dispatch(setFetchingAggsUTXOList(address));
            const UTXOResponse = await getAggsUTXOList(
                address,
                getNetworkIdByAddress(address)
            );
            dispatch(cacheAggsUTXOList(address, UTXOResponse));
            _.each(UTXOResponse, u => {
                dispatch(
                    cacheAssetScheme(new H256(u.assetType), u.assetScheme)
                );
            });
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
            +new Date() - cachedUTXOListByAddressAssetType.updatedAt < 3
        ) {
            return;
        }
        try {
            dispatch(setFetchingUTXOList(address, assetType));
            const UTXOListResponse = await getUTXOListByAssetType(
                address,
                assetType,
                getNetworkIdByAddress(address)
            );
            dispatch(cacheUTXOList(address, assetType, UTXOListResponse));
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    cacheAssetScheme,
    fetchAggsUTXOListIfNeed,
    fetchAssetSchemeIfNeed,
    fetchUTXOListIfNeed
};
