import {
    AssetTransferAddress,
    PlatformAddress
} from "codechain-sdk/lib/core/classes";
import _ from "lodash";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { toast } from "react-toastify";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { AddressType, WalletAddress } from "../../model/address";
import {
    createAssetAddress,
    createPlatformAddress,
    restoreAssetAddresses,
    restorePlatformAddresses
} from "../../model/keystore";
import { getAssetKeys, getPlatformKeys } from "../../utils/storage";

export type Action =
    | UpdateWalletPlatformAddresses
    | UpdateWalletAssetAddresses
    | ClearWalletAddresses
    | SetLoadingAssetAddresses
    | SetLoadingPlatformAddresses;

export enum ActionType {
    UpdateWalletPlatformAddresses = "UpdateWalletPlatformAddresses",
    UpdateWalletAssetAddresses = "UpdateWalletAssetAddresses",
    ClearWalletAddresses = "ClearWalletAddresses",
    SetLoadingPlatformAddresses = "SetLoadingPlatformAddresses",
    SetLoadingAssetAddresses = "SetLoadingAssetAddresses"
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

export interface ClearWalletAddresses {
    type: ActionType.ClearWalletAddresses;
}

export interface SetLoadingAssetAddresses {
    type: ActionType.SetLoadingAssetAddresses;
    data: {
        isLoading: boolean;
    };
}

export interface SetLoadingPlatformAddresses {
    type: ActionType.SetLoadingPlatformAddresses;
    data: {
        isLoading: boolean;
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
        const passphrase = getState().globalReducer.passphrase!;
        if (!getState().walletReducer.assetAddresses) {
            const savedAssetKeys = getAssetKeys(networkId);
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
                        index: key.pathIndex,
                        address,
                        type: AddressType.Asset
                    };
                });
            } else {
                dispatch({
                    type: ActionType.SetLoadingAssetAddresses,
                    data: {
                        isLoading: true
                    }
                });
                assetAddresses = await restoreAssetAddresses(
                    passphrase,
                    networkId
                );
                dispatch({
                    type: ActionType.SetLoadingAssetAddresses,
                    data: {
                        isLoading: false
                    }
                });
            }
            dispatch(updateWalletAssetAddresses(assetAddresses));
        }
        if (!getState().walletReducer.platformAddresses) {
            const savedPlatformKeys = getPlatformKeys(networkId);
            let platformAddresses;
            if (savedPlatformKeys) {
                platformAddresses = _.map(savedPlatformKeys, key => {
                    const address = PlatformAddress.fromAccountId(key.key, {
                        networkId
                    }).value;
                    return {
                        index: key.pathIndex,
                        address,
                        type: AddressType.Platform
                    };
                });
            } else {
                dispatch({
                    type: ActionType.SetLoadingPlatformAddresses,
                    data: {
                        isLoading: true
                    }
                });
                platformAddresses = await restorePlatformAddresses(
                    passphrase,
                    networkId
                );
                dispatch({
                    type: ActionType.SetLoadingPlatformAddresses,
                    data: {
                        isLoading: false
                    }
                });
            }
            dispatch(updateWalletPlatformAddresses(platformAddresses));
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
        if (platformAddresses && platformAddresses.length >= 10) {
            toast.error("Sorry, you can make up to 10 addresses.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
            return;
        }
        const passphrase = getState().globalReducer.passphrase!;
        const newAddresses = await createPlatformAddress(passphrase, networkId);
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
        if (assetAddresses && assetAddresses.length >= 10) {
            toast.error("Sorry, you can make up to 10 addresses.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
            return;
        }
        const passphrase = getState().globalReducer.passphrase!;
        const newAddresses = await createAssetAddress(passphrase, networkId);
        if (assetAddresses) {
            dispatch(
                updateWalletAssetAddresses([...assetAddresses, newAddresses])
            );
        } else {
            dispatch(updateWalletAssetAddresses([newAddresses]));
        }
    };
};

export default {
    fetchWalletFromStorageIfNeed,
    createWalletAssetAddress,
    createWalletPlatformAddress
};
