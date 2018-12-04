import {
    AssetTransferAddress,
    PlatformAddress
} from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import {
    AddressType,
    PlatformAccount,
    WalletAddress
} from "../../model/address";
import {
    createAssetAddress,
    createPlatformAddress,
    restoreAssetAddresses,
    restorePlatformAddresses
} from "../../model/keystore";
import { getPlatformAccount } from "../../networks/Api";
import { getAssetKeys, getPlatformKeys } from "../../utils/storage";

export type Action =
    | UpdateWalletPlatformAddresses
    | UpdateWalletAssetAddresses
    | UpdateAccount
    | SetFetchingAccount;

export enum ActionType {
    UpdateWalletPlatformAddresses = 3000,
    UpdateWalletAssetAddresses,
    UpdateAccount,
    SetFetchingAccount,
    ClearWallet
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
        dispatch(showLoading() as any);
        const networkId = getState().globalReducer.networkId;
        if (!getState().walletReducer.platformAddresses) {
            const savedPlatformKeys = getPlatformKeys();
            let platformAddresses;
            if (savedPlatformKeys) {
                platformAddresses = _.map(savedPlatformKeys, key => {
                    const address = PlatformAddress.fromAccountId(key.key, {
                        networkId
                    }).value;
                    return {
                        name: `P-address ${key.pathIndex}`,
                        address,
                        type: AddressType.Platform
                    };
                });
            } else {
                platformAddresses = await restorePlatformAddresses(networkId);
            }
            dispatch(updateWalletPlatformAddresses(platformAddresses));
        }
        if (!getState().walletReducer.assetAddresses) {
            const savedAssetKeys = getAssetKeys();
            let assetAddresses;
            if (savedAssetKeys) {
                assetAddresses = _.map(savedAssetKeys, key => {
                    const address = AssetTransferAddress.fromTypeAndPayload(
                        1,
                        key.key,
                        {
                            networkId
                        }
                    ).value;
                    return {
                        name: `A-address ${key.pathIndex}`,
                        address,
                        type: AddressType.Asset
                    };
                });
            } else {
                assetAddresses = await restoreAssetAddresses(networkId);
            }
            dispatch(updateWalletAssetAddresses(assetAddresses));
        }
        dispatch(hideLoading() as any);
    };
};

const createWalletPlatformAddress = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const networkId = getState().globalReducer.networkId;
        const platformAddresses = getState().walletReducer.platformAddresses;
        const newAddresses = await createPlatformAddress(networkId);
        if (platformAddresses) {
            dispatch(
                updateWalletPlatformAddresses([
                    ...platformAddresses,
                    newAddresses
                ])
            );
        } else {
            dispatch(updateWalletPlatformAddresses([newAddresses]));
        }
    };
};

const createWalletAssetAddress = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const networkId = getState().globalReducer.networkId;
        const assetAddresses = getState().walletReducer.assetAddresses;
        const newAddresses = await createAssetAddress(networkId);
        if (assetAddresses) {
            dispatch(
                updateWalletAssetAddresses([...assetAddresses, newAddresses])
            );
        } else {
            dispatch(updateWalletAssetAddresses([newAddresses]));
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
            dispatch(showLoading() as any);
            dispatch(setFetchingAccount(address));
            const networkId = getState().globalReducer.networkId;
            const accountResponse = await getPlatformAccount(
                address,
                networkId
            );
            dispatch(updateAccount(address, accountResponse));
            dispatch(hideLoading() as any);
        } catch (e) {
            console.log(e);
        }
    };
};

export default {
    fetchWalletFromStorageIfNeed,
    fetchAccountIfNeed,
    createWalletAssetAddress,
    createWalletPlatformAddress
};
