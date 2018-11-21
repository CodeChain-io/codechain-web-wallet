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
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { getCCKey } from "../../model/wallet";
import { ReducerConfigure } from "../../redux";
import assetActions from "../../redux/asset/assetActions";
import transactionActions from "../../redux/transaction/transactionActions";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../utils/network";
import ReceiverContainer from "./ReceiverContainer/ReceiverContainer";
import "./SendAsset.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
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
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H256, networkId: string) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchUTXOListIfNeed: (address: string, assetType: H256) => void;
    sendTransaction: (
        address: string,
        transferTx: AssetTransferTransaction
    ) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { assetType }
            }
        } = this.props;
        const {
            match: {
                params: { assetType: nextAssetType }
            }
        } = props;
        if (nextAssetType !== assetType) {
            this.init();
        }
    }

    public async componentDidMount() {
        this.init();
    }

    public render() {
        const {
            assetScheme,
            match: {
                params: { assetType, address }
            }
        } = this.props;
        const { availableAssets, isSendingTx, UTXOList } = this.props;
        if (!assetScheme || !UTXOList || !availableAssets) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
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
                    <Container>
                        <div className="mt-5">Invalid assetType</div>
                    </Container>
                </div>
            );
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Send-asset">
                <Container>
                    <div className="mt-5">
                        <h4>Send asset</h4>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center asset-info-item">
                        <div>
                            <ImageLoader
                                data={assetType}
                                isAssetImage={true}
                                networkId={getNetworkIdByAddress(address)}
                                size={50}
                            />
                        </div>
                        <div className="ml-2">
                            <p className="mb-0">{metadata.name || assetType}</p>
                            <p className="mb-0">{availableAsset.quantities}</p>
                        </div>
                    </div>
                    <hr />
                    <ReceiverContainer
                        onSubmit={this.handleSubmit}
                        totalQuantities={availableAsset.quantities}
                    />
                    {isSendingTx && <div>Sending...</div>}
                </Container>
            </div>
        );
    }

    private init = () => {
        this.getAssetScheme();
        this.getAvailableAssets();
        this.getUTXOList();
    };

    private handleSubmit = async (
        receivers: { receiver: string; quantities: number }[],
        passphrase: string
    ) => {
        const { UTXOList } = this.props;
        const {
            match: {
                params: { assetType, address }
            }
        } = this.props;
        const sumOfSendingAsset = _.sumBy(
            receivers,
            receiver => receiver.quantities
        );

        const inputUTXO = [];
        let currentSum = 0;
        // FIXME: Current UTXO List are containing only recent 25 temporary.
        // Use the custom pagination options to get all of the utxo.
        for (const utxo of UTXOList!) {
            inputUTXO.push(utxo);
            currentSum += utxo.asset.amount;
            if (currentSum > sumOfSendingAsset) {
                break;
            }
        }

        const networkId = getNetworkIdByAddress(address);
        const sdk = new SDK({
            server: "http://52.79.108.1:8080",
            networkId
        });
        const ccKey = await getCCKey();
        const keyStore = new LocalKeyStore(ccKey);

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
                recipient: receiver.receiver,
                amount: receiver.quantities,
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
        const {
            match: {
                params: { address, assetType }
            }
        } = this.props;
        this.props.fetchAssetSchemeIfNeed(
            new H256(assetType),
            getNetworkIdByAddress(address)
        );
    };

    private getUTXOList = async () => {
        const {
            match: {
                params: { address, assetType }
            }
        } = this.props;
        this.props.fetchUTXOListIfNeed(address, new H256(assetType));
    };

    private getAvailableAssets = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchAvailableAssets(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const {
        match: {
            params: { assetType, address }
        }
    } = ownProps;
    const assetScheme =
        state.assetReducer.assetScheme[new H256(assetType).value];
    const sendingTx = state.transactionReducer.sendingTx[address];
    const UTXOListByAddress = state.assetReducer.UTXOList[address];
    const UTXOListByAddressAssetType =
        UTXOListByAddress && UTXOListByAddress[assetType];
    const availableAssets = state.assetReducer.availableAssets[address];
    return {
        assetScheme: assetScheme && assetScheme.data,
        isSendingTx: sendingTx != null,
        UTXOList: UTXOListByAddressAssetType && UTXOListByAddressAssetType.data,
        availableAssets
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAssetSchemeIfNeed: (assetType: H256, networkId: string) => {
        dispatch(assetActions.fetchAssetSchemeIfNeed(assetType, networkId));
    },
    fetchAvailableAssets: (address: string) => {
        dispatch(assetActions.fetchAvailableAssets(address));
    },
    sendTransaction: (
        address: string,
        transferTx: AssetTransferTransaction
    ) => {
        dispatch(transactionActions.sendTransaction(address, transferTx));
    },
    fetchUTXOListIfNeed: (address: string, assetType: H256) => {
        dispatch(assetActions.fetchUTXOListIfNeed(address, assetType));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendAsset);
