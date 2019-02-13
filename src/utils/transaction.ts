import { TransactionDoc } from "codechain-indexer-types";
import { U64 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as Metadata from "./metadata";

function getAggsQuark(address: string, txList: TransactionDoc[]) {
    return _.reduce(
        txList,
        (memo, tx: TransactionDoc) => {
            let output = new U64(0);
            let input = new U64(0);
            if (tx.type === "pay") {
                const quantity = tx.pay.quantity;
                if (tx.pay.receiver === address) {
                    output = U64.plus(output, quantity);
                }
                if (tx.signer === address) {
                    input = U64.plus(input, quantity);
                }
            }
            if (tx.signer === address) {
                const fee = tx.fee;
                input = U64.plus(input, fee);
            }
            return {
                input: U64.plus(memo.input, input),
                output: U64.plus(memo.output, output)
            };
        },
        {
            input: new U64(0),
            output: new U64(0)
        }
    );
}

function getAggsAsset(
    address: string,
    transaction: TransactionDoc
): {
    assetType: string;
    inputQuantities: U64;
    outputQuantities: U64;
    burnQuantities: U64;
    metadata: Metadata.Metadata;
}[] {
    if (transaction.type === "mintAsset") {
        if (transaction.mintAsset.recipient === address) {
            return [
                {
                    assetType: transaction.mintAsset.assetType,
                    inputQuantities: new U64(0),
                    outputQuantities: new U64(transaction.mintAsset.supply),
                    burnQuantities: new U64(0),
                    metadata: Metadata.parseMetadata(
                        transaction.mintAsset.metadata
                    )
                }
            ];
        } else {
            return [];
        }
    } else if (transaction.type === "transferAsset") {
        const filteredInputs = _.filter(
            transaction.transferAsset.inputs,
            input => input.prevOut.owner === address
        );

        const filteredBurns = _.filter(
            transaction.transferAsset.burns,
            burn => burn.prevOut.owner === address
        );

        const filteredOutputs = _.filter(
            transaction.transferAsset.outputs,
            output => output.owner === address
        );
        const results: {
            [assetType: string]: {
                assetType: string;
                inputQuantities: U64;
                outputQuantities: U64;
                burnQuantities: U64;
                metadata: Metadata.Metadata;
            };
        } = {};
        _.each(filteredInputs, filteredInput => {
            if (results[filteredInput.prevOut.assetType]) {
                const before = results[filteredInput.prevOut.assetType];
                const newObject = {
                    ...before,
                    inputQuantities: U64.plus(
                        before.inputQuantities,
                        filteredInput.prevOut.quantity
                    )
                };
                results[filteredInput.prevOut.assetType] = newObject;
            } else {
                results[filteredInput.prevOut.assetType] = {
                    assetType: filteredInput.prevOut.assetType,
                    inputQuantities: new U64(filteredInput.prevOut.quantity),
                    outputQuantities: new U64(0),
                    burnQuantities: new U64(0),
                    metadata: Metadata.parseMetadata(
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
                    burnQuantities: U64.plus(
                        before.burnQuantities,
                        filteredBurn.prevOut.quantity
                    )
                };
                results[filteredBurn.prevOut.assetType] = newObject;
            } else {
                results[filteredBurn.prevOut.assetType] = {
                    assetType: filteredBurn.prevOut.assetType,
                    inputQuantities: new U64(0),
                    outputQuantities: new U64(0),
                    burnQuantities: new U64(filteredBurn.prevOut.quantity),
                    metadata: Metadata.parseMetadata(
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
                    outputQuantities: U64.plus(
                        before.outputQuantities,
                        filteredOutput.quantity
                    )
                };
                results[filteredOutput.assetType] = newObject;
            } else {
                results[filteredOutput.assetType] = {
                    assetType: filteredOutput.assetType,
                    inputQuantities: new U64(0),
                    outputQuantities: new U64(filteredOutput.quantity),
                    burnQuantities: new U64(0),
                    metadata: Metadata.parseMetadata(
                        filteredOutput.assetScheme.metadata
                    )
                };
            }
        });
        return _.values(results);
    }
    return [];
}

export const TxUtil = { getAggsAsset, getAggsQuark };
