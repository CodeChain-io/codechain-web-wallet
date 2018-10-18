import { WalletAddress } from "./model/address";

export type Action = Login & Logout & UpdateWalletAddresses & UpdateWalletName;

export interface Login {
    type: "Login";
}

export interface Logout {
    type: "Logout";
}

export interface UpdateWalletAddresses {
    type: "UpdateWalletAddresses";
    data: {
        platformAddresses: WalletAddress[];
        assetAddresses: WalletAddress[];
    };
}
export interface UpdateWalletName {
    type: "UpdateWalletName";
    data: string;
}

const login = (): Login => ({
    type: "Login"
});

const logout = (): Logout => ({
    type: "Logout"
});

const updateWalletAddresses = (
    platformAddresses: WalletAddress[],
    assetAddresses: WalletAddress[]
): UpdateWalletAddresses => ({
    type: "UpdateWalletAddresses",
    data: {
        platformAddresses,
        assetAddresses
    }
});

const updateWalletName = (walletName: string): UpdateWalletName => ({
    type: "UpdateWalletName",
    data: walletName
});

export const Actions = {
    login,
    logout,
    updateWalletAddresses,
    updateWalletName
};
