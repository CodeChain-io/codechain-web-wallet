import * as _ from "lodash";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    AddressType,
    PlatformAccount,
    WalletAddress
} from "../../model/address";
import {
    createAddress,
    getAssetAddresses,
    getPlatformAddresses,
    getWalletName,
    removeAssetAddress,
    removePlatformAddress
} from "../../model/keystore";
import { getPlatformAccount } from "../../networks/Api";

export type Action =
    | UpdateWalletPlatformAddresses
    | UpdateWalletAssetAddresses
    | UpdateWalletName
    | UpdateAccount
    | SetFetchingAccount
    | UpdateCreatingAddresses;

export enum ActionType {
    UpdateWalletPlatformAddresses = 3000,
    UpdateWalletAssetAddresses,
    UpdateWalletName,
    UpdateAccount,
    SetFetchingAccount,
    ClearWallet,
    UpdateCreatingAddresses
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

export interface UpdateCreatingAddresses {
    type: ActionType.UpdateCreatingAddresses;
    data: {
        addresses: WalletAddress[];
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

const updateCreatingAddresses = (
    addresses: WalletAddress[]
): UpdateCreatingAddresses => ({
    type: ActionType.UpdateCreatingAddresses,
    data: {
        addresses
    }
});

const fetchWalletFromStorageIfNeed = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const networkId = getState().globalReducer.networkId;
        if (!getState().walletReducer.platformAddresses) {
            const platformAddresses = await getPlatformAddresses(networkId);
            dispatch(updateWalletPlatformAddresses(platformAddresses));
        }
        if (!getState().walletReducer.assetAddresses) {
            const assetAddresses = await getAssetAddresses(networkId);
            dispatch(updateWalletAssetAddresses(assetAddresses));
        }
        if (!getState().walletReducer.walletName) {
            const walletName = await getWalletName();
            dispatch(updateWalletName(walletName));
        }
    };
};

const createWalletPlatformAddress = (name: string, passphrase: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        await createAddress(AddressType.Platform, name, passphrase);
        const networkId = getState().globalReducer.networkId;
        const platformAddresses = await getPlatformAddresses(networkId);
        dispatch(updateWalletPlatformAddresses(platformAddresses));

        const createdAddresses = _.last(platformAddresses);
        const creatingAddresses = getState().walletReducer.creatingAddresses;
        dispatch(
            updateCreatingAddresses(
                _.concat(creatingAddresses || [], [createdAddresses!])
            )
        );
    };
};

const createWalletAssetAddress = (name: string, passphrase: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        await createAddress(AddressType.Asset, name, passphrase);
        const networkId = getState().globalReducer.networkId;
        const assetAddresses = await getAssetAddresses(networkId);
        dispatch(updateWalletAssetAddresses(assetAddresses));

        const createdAddresses = _.last(assetAddresses);
        const creatingAddresses = getState().walletReducer.creatingAddresses;
        dispatch(
            updateCreatingAddresses(
                _.concat(creatingAddresses || [], [createdAddresses!])
            )
        );
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
            const networkId = getState().globalReducer.networkId;
            const accountResponse = await getPlatformAccount(
                address,
                networkId
            );
            dispatch(updateAccount(address, accountResponse));
        } catch (e) {
            console.log(e);
        }
    };
};

const removeWalletAddress = (address: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const networkId = getState().globalReducer.networkId;
        const addressTypeString = address.charAt(2);
        if (addressTypeString === "c") {
            await removePlatformAddress(address);
            const platformAddresses = await getPlatformAddresses(networkId);
            dispatch(updateWalletPlatformAddresses(platformAddresses));
        } else if (addressTypeString === "a") {
            await removeAssetAddress(address);
            const assetAddresses = await getAssetAddresses(networkId);
            dispatch(updateWalletAssetAddresses(assetAddresses));
        } else {
            throw Error("invalid addressType");
        }
        const creatingAddresses = getState().walletReducer.creatingAddresses;
        if (creatingAddresses) {
            const filteredAddresses = _.filter(
                creatingAddresses,
                creatingAddress => creatingAddress.address !== address
            );
            dispatch(updateCreatingAddresses(filteredAddresses));
        }
    };
};

export default {
    fetchWalletFromStorageIfNeed,
    fetchAccountIfNeed,
    createWalletAssetAddress,
    createWalletPlatformAddress,
    removeWalletAddress,
    updateWalletName
};
