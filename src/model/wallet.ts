import { SecretStorage } from "codechain-keystore";

export interface WalletKey {
    meta: string;
    assset: SecretStorage[];
    platform: SecretStorage[];
}
