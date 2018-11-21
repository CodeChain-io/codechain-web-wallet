import { WalletAddress } from "../../model/address";

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

export default {
    updateWalletAddresses,
    updateWalletName
};
