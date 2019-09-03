import { TransactionDoc } from "codechain-indexer-types";
import { SDK } from "codechain-sdk";
import { U64 } from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import _ from "lodash";
import { NetworkId } from "../model/address";
import {
    getAssetAddressPath,
    getCCKey,
    getFirstSeedHash,
    getPlatformAddressPath
} from "../model/keystore";
import { getCodeChainHost } from "./network";
import { getAssetKeys, getPlatformKeys } from "./storage";

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
}[] {
    if (transaction.type === "mintAsset") {
        if (transaction.mintAsset.recipient === address) {
            return [
                {
                    assetType: transaction.mintAsset.assetType,
                    inputQuantities: new U64(0),
                    outputQuantities: new U64(transaction.mintAsset.supply),
                    burnQuantities: new U64(0)
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
                    burnQuantities: new U64(0)
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
                    burnQuantities: new U64(filteredBurn.prevOut.quantity)
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
                    burnQuantities: new U64(0)
                };
            }
        });
        return _.values(results);
    }
    return [];
}

async function createMintAssetTx(data: {
    name: string;
    supply: U64;
    iconURL?: string;
    description?: string;
    recipient: string;
    networkId: NetworkId;
    feePayer: string;
    fee: U64;
    passphrase: string;
}) {
    const ccKey = await getCCKey();
    const storedPlatformKeys = getPlatformKeys(data.networkId);
    const storedAssetKeys = getAssetKeys(data.networkId);
    const seedHash = await getFirstSeedHash();
    const platformKeyMapping = _.reduce(
        storedPlatformKeys,
        (memo, storedPlatformKey) => {
            return {
                ...memo,
                [storedPlatformKey.key]: {
                    seedHash,
                    path: getPlatformAddressPath(storedPlatformKey.pathIndex)
                }
            };
        },
        {}
    );
    const assetKeyMapping = _.reduce(
        storedAssetKeys,
        (memo, storedAssetKey) => {
            return {
                ...memo,
                [storedAssetKey.key]: {
                    seedHash,
                    path: getAssetAddressPath(storedAssetKey.pathIndex)
                }
            };
        },
        {}
    );
    const keyStore = new LocalKeyStore(ccKey, {
        platform: platformKeyMapping,
        asset: assetKeyMapping
    });

    const sdk = new SDK({
        server: getCodeChainHost(data.networkId),
        networkId: data.networkId
    });
    const tx = sdk.core.createMintAssetTransaction({
        scheme: {
            shardId: 0,
            metadata: JSON.stringify({
                name: data.name,
                description: data.description,
                icon_url: data.iconURL
            }),
            supply: data.supply
        },
        recipient: data.recipient
    });

    const seq = await sdk.rpc.chain.getSeq(data.feePayer);

    const { transactions } = await sdk.rpc.chain.getPendingTransactions();
    const newSeq =
        seq +
        transactions.filter(
            t =>
                t.getSignerAddress({ networkId: data.networkId }).toString() ===
                data.feePayer
        ).length;

    const signedTransaction = await sdk.key.signTransaction(tx, {
        account: data.feePayer,
        keyStore,
        fee: data.fee,
        seq: newSeq,
        passphrase: data.passphrase
    });
    return signedTransaction;
}

export const TxUtil = { getAggsAsset, getAggsQuark, createMintAssetTx };
