import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import { WalletAddress } from "./model/address";

export type Action = Login &
    Logout &
    UpdateWalletAddresses &
    UpdateWalletName &
    CacheAssetScheme;

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

export interface CacheAssetScheme {
    type: "CacheAssetScheme";
    data: {
        assetType: string;
        assetScheme: AssetSchemeDoc;
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

const updateWalletName = (walletName: string): UpdateWalletName => ({
    type: "UpdateWalletName",
    data: walletName
});

const cacheAssetScheme = (
    assetType: H256,
    assetScheme: AssetSchemeDoc
): CacheAssetScheme => ({
    type: "CacheAssetScheme",
    data: {
        assetType: assetType.value,
        assetScheme
    }
});

export const Actions = {
    login,
    logout,
    updateWalletAddresses,
    updateWalletName,
    cacheAssetScheme
};
