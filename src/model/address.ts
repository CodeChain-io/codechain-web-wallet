import { U256 } from "codechain-sdk/lib/core/classes";

export type NetworkId = "cc" | "tc" | "sc" | "wc";

export interface WalletAddress {
    name: string;
    type: AddressType;
    address: string;
}

export enum AddressType {
    Platform,
    Asset
}

export interface PlatformAccount {
    balance: U256;
    nonce: U256;
}
