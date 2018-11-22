import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { PlatformAccount, WalletAddress } from "../../model/address";
import {
    getAssetAddresses,
    getPlatformAddresses,
    getWalletName
} from "../../model/wallet";
import { getPlatformAccount } from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";

export type Action =
    | UpdateWalletPlatformAddresses
    | UpdateWalletAssetAddresses
    | UpdateWalletName
    | UpdateAccount
    | SetFetchingAccount;

export enum ActionType {
    UpdateWalletPlatformAddresses = "updateWalletPlatformAddresses",
    UpdateWalletAssetAddresses = "updateWalletAssetAddresses",
    UpdateWalletName = "updateWalletName",
    UpdateAccount = "updateAccount",
    SetFetchingAccount = "setFetchingAccount"
}

export interface UpdateWalletName {
    type: ActionType.UpdateWalletName;
    data: string;
}

export interface UpdateWalletPlatformAddresses {
    type: ActionType.UpdateWalletPlatformAddresses;
    data: {
        platformAddresses: WalletAddress[];
    };
}

export interface UpdateWalletAssetAddresses {
    type: ActionType.UpdateWalletAssetAddresses;
    data: {
        assetAddresses: WalletAddress[];
    };
}

export interface UpdateAccount {
    type: ActionType.UpdateAccount;
    data: {
        address: string;
        account: PlatformAccount;
    };
}

export interface SetFetchingAccount {
    type: ActionType.SetFetchingAccount;
    data: {
        address: string;
    };
}

const updateWalletName = (walletName: string): UpdateWalletName => ({
    type: ActionType.UpdateWalletName,
    data: walletName
});

const updateWalletPlatformAddresses = (
    platformAddresses: WalletAddress[]
): UpdateWalletPlatformAddresses => ({
    type: ActionType.UpdateWalletPlatformAddresses,
    data: {
        platformAddresses
    }
});

const updateWalletAssetAddresses = (
    assetAddresses: WalletAddress[]
): UpdateWalletAssetAddresses => ({
    type: ActionType.UpdateWalletAssetAddresses,
    data: {
        assetAddresses
    }
});

const fetchWalletFromStorageIfNeed = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        if (!getState().walletReducer.platformAddresses) {
            const platformAddresses = await getPlatformAddresses();
            dispatch(updateWalletPlatformAddresses(platformAddresses));
        }
        if (!getState().walletReducer.assetAddresses) {
            const assetAddresses = await getAssetAddresses();
            dispatch(updateWalletAssetAddresses(assetAddresses));
        }
        if (!getState().walletReducer.walletName) {
            const walletName = await getWalletName();
            dispatch(updateWalletName(walletName));
        }
    };
};

const setFetchingAccount = (address: string): SetFetchingAccount => ({
    type: ActionType.SetFetchingAccount,
    data: {
        address
    }
});

const updateAccount = (
    address: string,
    account: PlatformAccount
): UpdateAccount => ({
    type: ActionType.UpdateAccount,
    data: {
        address,
        account
    }
});

const fetchAccountIfNeed = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const cachedAccount = getState().walletReducer.accounts[address];
        if (cachedAccount && cachedAccount.isFetching) {
            return;
        }
        if (
            cachedAccount &&
            cachedAccount.updatedAt &&
            +new Date() - cachedAccount.updatedAt < 3000
        ) {
            return;
        }
        try {
            dispatch(setFetchingAccount(address));
            const accountResponse = await getPlatformAccount(
                address,
                getNetworkIdByAddress(address)
            );
            dispatch(updateAccount(address, accountResponse));
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    fetchWalletFromStorageIfNeed,
    fetchAccountIfNeed
};
