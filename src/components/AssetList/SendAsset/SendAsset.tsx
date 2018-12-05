import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AssetSchemeDoc, UTXO } from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import { SDK } from "codechain-sdk";
import {
    Asset,
    AssetTransferAddress,
    AssetTransferOutput,
    AssetTransferTransaction,
    H256
} from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import * as _ from "lodash";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../model/address";
import { getCCKey } from "../../../model/keystore";
import { ReducerConfigure } from "../../../redux";
import assetActions from "../../../redux/asset/assetActions";
import chainActions from "../../../redux/chain/chainActions";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { getCodeChainHost } from "../../../utils/network";
import ReceiverContainer from "./ReceiverContainer/ReceiverContainer";
import "./SendAsset.css";

interface OwnProps {
    address: string;
    selectedAssetType: string;
    onClose: () => void;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
    isSendingTx: boolean;
    UTXOList: UTXO[] | null;
    availableAssets?:
        | {
              assetType: string;
              quantities: number;
              metadata: MetadataFormat;
          }[]
        | null;
    networkId: NetworkId;
    passphrase: string;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H256) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchUTXOListIfNeed: (address: string, assetType: H256) => void;
    sendTransaction: (
        address: string,
        transferTx: AssetTransferTransaction
    ) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props, any> {
    public render() {
        const { onClose } = this.props;
        const {
            assetScheme,
            selectedAssetType: assetType,
            networkId
        } = this.props;
        const { availableAssets, isSendingTx, UTXOList } = this.props;
        if (!assetScheme || !UTXOList || !availableAssets) {
            return (
                <div>
                    <div className="mt-5">Loading...</div>
                </div>
            );
        }
        const availableAsset = _.find(
            availableAssets,
            a => a.assetType === assetType
        );
        if (!availableAsset) {
            return (
                <div>
                    <div className="mt-5">Invalid assetType</div>
                </div>
            );
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Send-asset animated fadeIn">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Send asset</h2>
                <div className="d-flex align-items-center asset-info-item mb-5">
                    <ImageLoader
                        className="asset-info-icon"
                        data={assetType}
                        isAssetImage={true}
                        networkId={networkId}
                        size={50}
                    />
                    <span className="name ml-3 mr-auto">
                        {metadata.name ||
                            `...${assetType.slice(
                                assetType.length - 6,
                                assetType.length
                            )}`}
                    </span>
                    <span className="quantity number">
                        {availableAsset.quantities.toLocaleString()}
                    </span>
                </div>
                <ReceiverContainer
                    onSubmit={this.handleSubmit}
                    totalQuantity={availableAsset.quantities}
                />
                {isSendingTx && <div>Sending...</div>}
            </div>
        );
    }

    public async componentDidMount() {
        this.init();
    }

    private init = () => {
        this.getAssetScheme();
        this.getAvailableAssets();
        this.getUTXOList();
    };

    private handleSubmit = async (
        receivers: { address: string; quantity: number }[]
    ) => {
        const { UTXOList } = this.props;
        const {
            selectedAssetType: assetType,
            address,
            networkId,
            passphrase
        } = this.props;
        const sumOfSendingAsset = _.sumBy(
            receivers,
            receiver => receiver.quantity
        );

        const inputUTXO = [];
        let currentSum = 0;
        for (const utxo of UTXOList!) {
            inputUTXO.push(utxo);
            currentSum += utxo.asset.amount;
            if (currentSum > sumOfSendingAsset) {
                break;
            }
        }

        const sdk = new SDK({
            server: getCodeChainHost(networkId),
            networkId
        });
        const ccKey = await getCCKey();
        // FIXME: remove any
        const keyStore = new LocalKeyStore(ccKey as any);

        const inputAssets = _.map(inputUTXO, utxo => {
            return Asset.fromJSON({
                asset_type: utxo.asset.assetType,
                lock_script_hash: utxo.asset.lockScriptHash,
                parameters: utxo.asset.parameters,
                amount: utxo.asset.amount,
                transactionHash: utxo.asset.transactionHash,
                transactionOutputIndex: utxo.asset.transactionOutputIndex
            }).createTransferInput();
        });
        const outputData = _.map(receivers, receiver => {
            return {
                recipient: receiver.address,
                amount: receiver.quantity,
                assetType
            };
        });
        outputData.push({
            recipient: address,
            amount: currentSum - sumOfSendingAsset,
            assetType
        });
        const outputs = _.map(
            outputData,
            o =>
                new AssetTransferOutput({
                    recipient: AssetTransferAddress.fromString(o.recipient),
                    amount: o.amount,
                    assetType: new H256(o.assetType)
                })
        );
        const transferTx = sdk.core.createAssetTransferTransaction({
            inputs: inputAssets,
            outputs
        });
        try {
            await Promise.all(
                _.map(inputAssets, (_A, index) => {
                    return sdk.key.signTransactionInput(transferTx, index, {
                        keyStore,
                        passphrase
                    });
                })
            );
            this.props.sendTransaction(address, transferTx);
        } catch (e) {
            if (e.message === "DecryptionFailed") {
                alert("Invalid password");
            }
            console.log(e);
        }
    };

    private getAssetScheme = async () => {
        const { selectedAssetType: assetType } = this.props;
        this.props.fetchAssetSchemeIfNeed(new H256(assetType));
    };

    private getUTXOList = async () => {
        const { selectedAssetType: assetType, address } = this.props;
        this.props.fetchUTXOListIfNeed(address, new H256(assetType));
    };

    private getAvailableAssets = async () => {
        const { address } = this.props;
        this.props.fetchAvailableAssets(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { selectedAssetType, address } = ownProps;
    const assetScheme =
        state.assetReducer.assetScheme[new H256(selectedAssetType).value];
    const sendingTx = state.chainReducer.sendingTx[address];
    const UTXOListByAddress = state.assetReducer.UTXOList[address];
    const UTXOListByAddressAssetType =
        UTXOListByAddress && UTXOListByAddress[selectedAssetType];
    const availableAssets = state.assetReducer.availableAssets[address];
    const networkId = state.globalReducer.networkId;
    const passphrase = state.globalReducer.passphrase!;
    return {
        assetScheme: assetScheme && assetScheme.data,
        isSendingTx: sendingTx != null,
        UTXOList: UTXOListByAddressAssetType && UTXOListByAddressAssetType.data,
        availableAssets,
        networkId,
        passphrase
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAssetSchemeIfNeed: (assetType: H256) => {
        dispatch(assetActions.fetchAssetSchemeIfNeed(assetType));
    },
    fetchAvailableAssets: (address: string) => {
        dispatch(assetActions.fetchAvailableAssets(address));
    },
    sendTransaction: (
        address: string,
        transferTx: AssetTransferTransaction
    ) => {
        dispatch(chainActions.sendTransaction(address, transferTx));
    },
    fetchUTXOListIfNeed: (address: string, assetType: H256) => {
        dispatch(assetActions.fetchUTXOListIfNeed(address, assetType));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendAsset);
