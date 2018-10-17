import { WalletAddress } from "./model/address";

export type Action = Login & Logout & UpdateWalletAddresses;

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

export const Actions = {
    login,
    logout,
    updateWalletAddresses
};
