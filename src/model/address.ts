import { U256 } from "codechain-sdk/lib/core/classes";

export interface WalletAddress {
    name: string;
    type: AddressType;
    address: string;
    networkId: string;
}

export enum AddressType {
    Platform,
    Asset
}

export interface PlatformAccount {
    balance: U256;
    nonce: U256;
}
