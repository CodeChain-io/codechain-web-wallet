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
    balance: string;
    nonce: string;
}
