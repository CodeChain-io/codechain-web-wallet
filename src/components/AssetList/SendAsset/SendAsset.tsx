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
    H256,
    SignedParcel,
    U256
} from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import * as _ from "lodash";
import { connect } from "react-redux";
import * as Spinner from "react-spinkit";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId, WalletAddress } from "../../../model/address";
import {
    getAssetAddressPath,
    getCCKey,
    getFirstSeedHash,
    getPlatformAddressPath
} from "../../../model/keystore";
import { ReducerConfigure } from "../../../redux";
import assetActions from "../../../redux/asset/assetActions";
import { getIdForCacheUTXO } from "../../../redux/asset/assetReducer";
import chainActions from "../../../redux/chain/chainActions";
import walletActions from "../../../redux/wallet/walletActions";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { getCodeChainHost } from "../../../utils/network";
import { getAssetKeys, getPlatformKeys } from "../../../utils/storage";
import * as CheckIcon from "./img/check_icon.svg";
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
    assetAddresses?: WalletAddress[] | null;
    platformAddresses?: WalletAddress[] | null;
}

interface State {
    isSendBtnClicked?: boolean;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H256) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchUTXOListIfNeed: (address: string, assetType: H256) => void;
    sendTransactionByGateway: (
        address: string,
        transferTx: AssetTransferTransaction,
        getewayURL: string
    ) => void;
    fetchWalletFromStorageIfNeed: () => void;
    sendTransactionByParcel: (
        address: string,
        signedParcel: SignedParcel,
        transferTx: AssetTransferTransaction,
        feePayer: string
    ) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isSendBtnClicked: undefined
        };
    }
    public render() {
        const { onClose } = this.props;
        const { isSendBtnClicked } = this.state;
        const {
            assetScheme,
            selectedAssetType: assetType,
            networkId,
            address
        } = this.props;
        const {
            availableAssets,
            isSendingTx,
            UTXOList,
            platformAddresses,
            assetAddresses
        } = this.props;
        if (
            !assetScheme ||
            !UTXOList ||
            !availableAssets ||
            !platformAddresses ||
            !assetAddresses
        ) {
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
                {isSendBtnClicked && !isSendingTx ? (
                    <div className="d-flex align-items-center justify-content-center text-center complete-container">
                        <div className="text-center">
                            <div>
                                <img src={CheckIcon} />
                            </div>
                            <div className="mt-3">
                                <span>COMPLETE!</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
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
                            address={address}
                            onSubmit={this.handleSubmit}
                            totalQuantity={availableAsset.quantities}
                            gatewayURL={
                                metadata.gateway && metadata.gateway.url
                            }
                        />
                    </div>
                )}
                {isSendingTx && (
                    <div className="sending-panel d-flex align-items-center justify-content-center">
                        <Spinner name="line-scale" color="white" />
                    </div>
                )}
            </div>
        );
    }

    public async componentDidMount() {
        this.init();
    }

    private init = () => {
        const { selectedAssetType, address } = this.props;
        this.props.fetchAssetSchemeIfNeed(new H256(selectedAssetType));
        this.props.fetchUTXOListIfNeed(address, new H256(selectedAssetType));
        this.props.fetchAvailableAssets(address);
        this.props.fetchWalletFromStorageIfNeed();
    };

    private handleSubmit = async (
        receivers: { address: string; quantity: number }[],
        fee?: {
            payer: string;
            amount: U256;
        } | null
    ) => {
        const { UTXOList } = this.props;
        const {
            selectedAssetType: assetType,
            address,
            networkId,
            passphrase,
            assetAddresses,
            platformAddresses,
            assetScheme
        } = this.props;

        if (!assetAddresses || !platformAddresses || !assetScheme) {
            return;
        }

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

        const storedPlatformKeys = getPlatformKeys(networkId);
        const storedAssetKeys = getAssetKeys(networkId);
        const seedHash = await getFirstSeedHash();

        const platformKeyMapping = _.reduce(
            storedPlatformKeys,
            (memo, storedPlatformKey) => {
                return {
                    ...memo,
                    [storedPlatformKey.key]: {
                        seedHash,
                        path: getPlatformAddressPath(
                            storedPlatformKey.pathIndex
                        )
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
        } catch (e) {
            if (e.message === "DecryptionFailed") {
                toast.error("Invalid password", {
                    position: toast.POSITION.BOTTOM_CENTER,
                    autoClose: 1000,
                    closeButton: false,
                    hideProgressBar: true
                });
            }
            console.log(e);
            return;
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        if (metadata.gateway) {
            this.props.sendTransactionByGateway(
                address,
                transferTx,
                metadata.gateway.url
            );
        } else {
            const parcel = sdk.core.createAssetTransactionGroupParcel({
                transactions: [transferTx]
            });
            const feePayer = fee!.payer;
            const nonce = await sdk.rpc.chain.getNonce(feePayer);
            const signedParcel = await sdk.key.signParcel(parcel, {
                account: feePayer,
                keyStore,
                fee: fee!.amount,
                nonce,
                passphrase
            });
            this.props.sendTransactionByParcel(
                address,
                signedParcel,
                transferTx,
                feePayer
            );
        }
        this.setState({ isSendBtnClicked: true });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { selectedAssetType, address } = ownProps;
    const assetScheme =
        state.assetReducer.assetScheme[new H256(selectedAssetType).value];
    const sendingTx = state.chainReducer.sendingTx[address];
    const id = getIdForCacheUTXO(address, new H256(selectedAssetType));
    const UTXOList = state.assetReducer.UTXOList[id];
    const availableAssets = state.assetReducer.availableAssets[address];
    const networkId = state.globalReducer.networkId;
    const passphrase = state.globalReducer.passphrase!;
    const assetAddresses = state.walletReducer.assetAddresses;
    const platformAddresses = state.walletReducer.platformAddresses;
    return {
        assetScheme: assetScheme && assetScheme.data,
        isSendingTx: sendingTx != null,
        UTXOList: UTXOList && UTXOList.data,
        availableAssets,
        networkId,
        passphrase,
        platformAddresses,
        assetAddresses
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
    sendTransactionByGateway: (
        address: string,
        transferTx: AssetTransferTransaction,
        gatewayURL: string
    ) => {
        dispatch(
            chainActions.sendTransactionByGateway(
                address,
                transferTx,
                gatewayURL
            )
        );
    },
    sendTransactionByParcel: (
        address: string,
        signedParcel: SignedParcel,
        transferTx: AssetTransferTransaction,
        feePayer: string
    ) => {
        dispatch(
            chainActions.sendTransactionByParcel(
                address,
                signedParcel,
                transferTx,
                feePayer
            )
        );
    },
    fetchUTXOListIfNeed: (address: string, assetType: H256) => {
        dispatch(assetActions.fetchUTXOListIfNeed(address, assetType));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendAsset);
