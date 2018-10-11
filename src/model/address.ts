import { BigNumber } from "bignumber.js";

export interface WalletAddress {
    name: string;
    totalAmount: BigNumber;
    type: "Platform" | "Asset";
    address: string;
}
