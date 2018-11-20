import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";

export type Action = Login | Logout | CacheAssetScheme;

export enum ActionType {
    Login = "login",
    Logout = "logout",
    CacheAssetScheme = "cacheAssetScheme"
}

export interface Login {
    type: ActionType.Login;
}

export interface Logout {
    type: ActionType.Logout;
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

export default {
    login,
    logout,
    cacheAssetScheme
};
