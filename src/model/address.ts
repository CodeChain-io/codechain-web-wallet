import { U64 } from "codechain-sdk/lib/core/classes";

export type NetworkId = "cc" | "tc" | "sc" | "wc";

export interface WalletAddress {
    index: number;
    type: AddressType;
    address: string;
}

export enum AddressType {
    Platform,
    Asset
}

export interface PlatformAccount {
    balance: U64;
    seq: U64;
}

export function isAssetAddress(address: string) {
    return address[2] === "a";
}

export function isPlatformAddress(address: string) {
    return address[2] === "c";
}
