import { AssetDoc } from "codechain-indexer-types/lib/types";
import { H256 } from "codechain-sdk/lib/core/classes";

export interface AggsUTXO {
    assetType: H256;
    totalAssetQuantity: number;
    utxoQuantity: number;
}

export interface UTXO {
    asset: AssetDoc;
    blockNumber: number;
    parcelIndex: number;
    transactionIndex: number;
}
