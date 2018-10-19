import { H256 } from "codechain-sdk/lib/core/classes";

export interface AggsUTXO {
    assetType: H256;
    totalAssetQuantity: number;
    utxoQuantity: number;
}
