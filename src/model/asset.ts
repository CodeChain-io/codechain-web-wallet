import { H256 } from "codechain-sdk/lib/core/classes";

export interface AddressUTXO {
    assetType: H256;
    totalAssetQuantity: number;
    utxoQuantity: number;
}
