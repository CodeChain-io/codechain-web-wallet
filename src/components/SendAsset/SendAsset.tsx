import {
    AggsUTXO,
    AssetSchemeDoc,
    UTXO
} from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { SDK } from "codechain-sdk";
import {
    Asset,
    AssetTransferAddress,
    AssetTransferOutput,
    H256
} from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Container } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { getCCKey } from "../../model/wallet";
import {
    getAggsUTXOByAssetType,
    getAssetByAssetType,
    getUTXOListByAssetType,
    sendTxToGateway
} from "../../networks/Api";
import { IRootState } from "../../reducers";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../utils/network";
import ReceiverContainer from "./ReceiverContainer/ReceiverContainer";
import "./SendAsset.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc;
}

interface DispatchProps {
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => void;
}

interface State {
    aggsUTXO?: AggsUTXO;
    UTXOList?: UTXO[];
    hasUTXOListRequested: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            aggsUTXO: undefined,
            UTXOList: undefined,
            hasUTXOListRequested: false
        };
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
            this.setState({
                UTXOList: [],
                aggsUTXO: undefined,
                hasUTXOListRequested: false
            });
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
        const { aggsUTXO, hasUTXOListRequested } = this.state;
        if (!assetScheme || !hasUTXOListRequested || !aggsUTXO) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
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
                            <p className="mb-0">
                                {aggsUTXO.totalAssetQuantity}
                            </p>
                        </div>
                    </div>
                    <hr />
                    <ReceiverContainer
                        onSubmit={this.handleSubmit}
                        totalQuantities={aggsUTXO.totalAssetQuantity}
                    />
                </Container>
            </div>
        );
    }

    private init = () => {
        this.getAssetScheme();
        this.getAggsUTXO();
        this.getUTXOList();
    };

    private handleSubmit = async (
        receivers: { receiver: string; quantities: number }[],
        passphrase: string
    ) => {
        const { UTXOList } = this.state;
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
            await sendTxToGateway(transferTx, networkId);
            alert("success!");
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
            },
            assetScheme,
            cacheAssetScheme
        } = this.props;
        if (!assetScheme) {
            const networkId = getNetworkIdByAddress(address);
            try {
                const responseAssetScheme = await getAssetByAssetType(
                    new H256(assetType),
                    networkId
                );
                cacheAssetScheme(new H256(assetType), responseAssetScheme);
            } catch (e) {
                console.log(e);
            }
        }
    };

    private getUTXOList = async () => {
        const {
            match: {
                params: { address, assetType }
            }
        } = this.props;
        try {
            const UTXOListResponse = await getUTXOListByAssetType(
                address,
                new H256(assetType),
                getNetworkIdByAddress(address)
            );
            this.setState({
                UTXOList: UTXOListResponse,
                hasUTXOListRequested: true
            });
        } catch (e) {
            console.log(e);
        }
    };

    private getAggsUTXO = async () => {
        const {
            match: {
                params: { address, assetType }
            }
        } = this.props;
        try {
            const aggsUTXO = await getAggsUTXOByAssetType(
                address,
                new H256(assetType),
                getNetworkIdByAddress(address)
            );
            this.setState({ aggsUTXO });
        } catch (e) {
            console.log(e);
        }
    };
}

const mapStateToProps = (state: IRootState, ownProps: OwnProps) => {
    const {
        match: {
            params: { assetType }
        }
    } = ownProps;
    return {
        assetScheme: state.assetScheme[new H256(assetType).value]
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => {
        dispatch(Actions.cacheAssetScheme(assetType, assetScheme));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendAsset);
