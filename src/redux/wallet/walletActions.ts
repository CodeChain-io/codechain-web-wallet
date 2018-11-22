import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { WalletAddress } from "../../model/address";
import {
    getAssetAddresses,
    getPlatformAddresses,
    getWalletName
} from "../../model/wallet";

export type Action = UpdateWalletAddresses | UpdateWalletName;

export enum ActionType {
    UpdateWalletAddresses = "updateWalletAddresses",
    UpdateWalletName = "UpdateWalletName"
}

export interface UpdateWalletName {
    type: ActionType.UpdateWalletName;
    data: string;
}

export interface UpdateWalletAddresses {
    type: ActionType.UpdateWalletAddresses;
    data: {
        platformAddresses: WalletAddress[];
        assetAddresses: WalletAddress[];
    };
}

const updateWalletName = (walletName: string): UpdateWalletName => ({
    type: ActionType.UpdateWalletName,
    data: walletName
});

const updateWalletAddresses = (
    platformAddresses: WalletAddress[],
    assetAddresses: WalletAddress[]
): UpdateWalletAddresses => ({
    type: ActionType.UpdateWalletAddresses,
    data: {
        platformAddresses,
        assetAddresses
    }
});

const fetchWalletFromStorage = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        const platformAddresses = await getPlatformAddresses();
        const assetAddresses = await getAssetAddresses();
        const walletName = await getWalletName();
        dispatch(updateWalletAddresses(platformAddresses, assetAddresses));
        dispatch(updateWalletName(walletName));
    };
};

export default {
    fetchWalletFromStorage
};
