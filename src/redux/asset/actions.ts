import { AggsUTXO, AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { getAggsUTXOList } from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";

export type Action =
    | CacheAssetScheme
    | CacheAggsUTXOList
    | SetFetchingAggsUTXOList;

export enum ActionType {
    CacheAssetScheme = "cacheAssetScheme",
    CacheAggsUTXOList = "cacheAggsUTXOList",
    SetFetchingAggsUTXOList = "setFetchingAggsUTXOList"
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
        try {
            const UTXO = await getAggsUTXOList(
                address,
                getNetworkIdByAddress(address)
            );
            dispatch(cacheAggsUTXOList(address, UTXO));
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    cacheAssetScheme,
    fetchAggsUTXOListIfNeed
};
