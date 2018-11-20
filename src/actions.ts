import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";
import { WalletAddress } from "./model/address";

export type Action = Login &
    Logout &
    UpdateWalletAddresses &
    UpdateWalletName &
    CacheAssetScheme;

export enum ActionType {
    Login,
    Logout,
    UpdateWalletAddresses,
    UpdateWalletName,
    CacheAssetScheme
}

export interface Login {
    type: ActionType.Login;
}

export interface Logout {
    type: ActionType.Logout;
}

export interface UpdateWalletAddresses {
    type: ActionType.UpdateWalletAddresses;
    data: {
        platformAddresses: WalletAddress[];
        assetAddresses: WalletAddress[];
    };
}

export interface UpdateWalletName {
    type: ActionType.UpdateWalletName;
    data: string;
}

export interface CacheAssetScheme {
    type: ActionType.CacheAssetScheme;
    data: {
        assetType: string;
        assetScheme: AssetSchemeDoc;
    };
}

const login = (): Login => ({
    type: ActionType.Login
});

const logout = (): Logout => ({
    type: ActionType.Logout
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

const updateWalletName = (walletName: string): UpdateWalletName => ({
    type: ActionType.UpdateWalletName,
    data: walletName
});

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

export const Actions = {
    login,
    logout,
    updateWalletAddresses,
    updateWalletName,
    cacheAssetScheme
};
