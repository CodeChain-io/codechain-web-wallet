import {
    AssetMintTransactionDoc,
    AssetTransferTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import * as _ from "lodash";

function getAssetHistoryFromTransaction(
    address: string,
    transaction: TransactionDoc
): {
    assetType: string;
    inputQuantities: number;
    outputQuantities: number;
    burnQuantities: number;
    metadata: MetadataFormat;
}[] {
    if (Type.isAssetMintTransactionDoc(transaction)) {
        const mintTx = transaction as AssetMintTransactionDoc;
        if (mintTx.data.output.owner === address) {
            return [
                {
                    assetType: mintTx.data.output.assetType,
                    inputQuantities: 0,
                    outputQuantities: mintTx.data.output.amount || 0,
                    burnQuantities: 0,
                    metadata: Type.getMetadata(mintTx.data.metadata)
                }
            ];
        } else {
            return [];
        }
    } else {
        const transferTx = transaction as AssetTransferTransactionDoc;
        const filteredInputs = _.filter(
            transferTx.data.inputs,
            input => input.prevOut.owner === address
        );

        const filteredBurns = _.filter(
            transferTx.data.burns,
            burn => burn.prevOut.owner === address
        );

        const filteredOutputs = _.filter(
            transferTx.data.outputs,
            output => output.owner === address
        );
        const results: {
            [assetType: string]: {
                assetType: string;
                inputQuantities: number;
                outputQuantities: number;
                burnQuantities: number;
                metadata: MetadataFormat;
            };
        } = {};
        _.each(filteredInputs, filteredInput => {
            if (results[filteredInput.prevOut.assetType]) {
                const before = results[filteredInput.prevOut.assetType];
                const newObject = {
                    ...before,
                    inputQuantities:
                        before.inputQuantities + filteredInput.prevOut.amount
                };
                results[filteredInput.prevOut.assetType] = newObject;
            } else {
                results[filteredInput.prevOut.assetType] = {
                    assetType: filteredInput.prevOut.assetType,
                    inputQuantities: filteredInput.prevOut.amount,
                    outputQuantities: 0,
                    burnQuantities: 0,
                    metadata: Type.getMetadata(
                        filteredInput.prevOut.assetScheme.metadata
                    )
                };
            }
        });
        _.each(filteredBurns, filteredBurn => {
            if (results[filteredBurn.prevOut.assetType]) {
                const before = results[filteredBurn.prevOut.assetType];
                const newObject = {
                    ...before,
                    burnQuantities:
                        before.burnQuantities + filteredBurn.prevOut.amount
                };
                results[filteredBurn.prevOut.assetType] = newObject;
            } else {
                results[filteredBurn.prevOut.assetType] = {
                    assetType: filteredBurn.prevOut.assetType,
                    inputQuantities: 0,
                    outputQuantities: 0,
                    burnQuantities: filteredBurn.prevOut.amount,
                    metadata: Type.getMetadata(
                        filteredBurn.prevOut.assetScheme.metadata
                    )
                };
            }
        });
        _.each(filteredOutputs, filteredOutput => {
            if (results[filteredOutput.assetType]) {
                const before = results[filteredOutput.assetType];
                const newObject = {
                    ...before,
                    outputQuantities:
                        before.outputQuantities + filteredOutput.amount
                };
                results[filteredOutput.assetType] = newObject;
            } else {
                results[filteredOutput.assetType] = {
                    assetType: filteredOutput.assetType,
                    inputQuantities: 0,
                    outputQuantities: filteredOutput.amount,
                    burnQuantities: 0,
                    metadata: Type.getMetadata(
                        filteredOutput.assetScheme.metadata
                    )
                };
            }
        });
        return _.values(results);
    }
}

export const TxUtil = { getAssetHistoryFromTransaction };
