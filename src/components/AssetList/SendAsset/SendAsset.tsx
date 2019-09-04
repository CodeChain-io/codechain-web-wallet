import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AssetSchemeDoc, UTXODoc } from "codechain-indexer-types";
import { SDK } from "codechain-sdk";
import {
    Asset,
    AssetTransferAddress,
    AssetTransferOutput,
    H160,
    SignedTransaction,
    Transaction,
    U64
} from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import _ from "lodash";
import { connect } from "react-redux";
import Spinner from "react-spinkit";
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
import * as Metadata from "../../../utils/metadata";
import { getCodeChainHost } from "../../../utils/network";
import { getAssetKeys, getPlatformKeys } from "../../../utils/storage";
import CheckIcon from "./img/check_icon.svg";
import ReceiverContainer from "./ReceiverContainer/ReceiverContainer";
import "./SendAsset.css";

interface OwnProps {
    address: string;
    selectedAssetType: string;
    onClose: () => void;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
    UTXOList?: UTXODoc[] | null;
    availableAssets?:
        | {
              assetType: string;
              quantities: U64;
          }[]
        | null;
    networkId: NetworkId;
    passphrase: string;
    assetAddresses?: WalletAddress[] | null;
    platformAddresses?: WalletAddress[] | null;
}

interface State {
    isSendingTx: boolean;
    isSentTx: boolean;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H160) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchUTXOListIfNeed: (address: string, assetType: H160) => void;
    sendTransactionByGateway: (
        address: string,
        transferTx: Transaction,
        gatewayURL: string
    ) => Promise<unknown>;
    fetchWalletFromStorageIfNeed: () => void;
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction,
        feePayer: string
    ) => Promise<unknown>;
}

type Props = WithTranslation & OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isSendingTx: false,
            isSentTx: false
        };
    }
    public render() {
        const { onClose } = this.props;
        const { isSendingTx, isSentTx } = this.state;
        const {
            assetScheme,
            selectedAssetType: assetType,
            networkId,
            address
        } = this.props;
        const {
            availableAssets,
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
                    <div className="Send-asset">
                        <div className="loading-container" />
                    </div>
                </div>
            );
        }
        const availableAsset = _.find(
            availableAssets,
            a => a.assetType === assetType
        );
        const metadata = Metadata.parseMetadata(assetScheme.metadata);
        return (
            <div className="Send-asset animated fadeIn">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">
                    <Trans i18nKey="send:asset.title" />
                </h2>
                {isSentTx ? (
                    <div className="d-flex align-items-center justify-content-center text-center complete-container">
                        <div className="text-center">
                            <div>
                                <img src={CheckIcon} alt={"check"} />
                            </div>
                            <div className="mt-3">
                                <span>
                                    <Trans i18nKey="send:asset.complete" />
                                </span>
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
                                {availableAsset
                                    ? availableAsset.quantities.toLocaleString()
                                    : 0}
                            </span>
                        </div>
                        <ReceiverContainer
                            address={address}
                            onSubmit={this.handleSubmit}
                            totalQuantity={
                                availableAsset
                                    ? availableAsset.quantities
                                    : new U64(0)
                            }
                            isSendingTx={isSendingTx}
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

    public updateWindowDimensions = () => {
        if (window.innerWidth <= 872) {
            this.addModalOpenClass();
        } else {
            this.removeModalOpenClass();
        }
    };

    public async componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        this.init();
    }

    public componentWillUnmount() {
        this.removeModalOpenClass();
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    private addModalOpenClass = () => {
        document.body.className = "modal-open";
    };

    private removeModalOpenClass = () => {
        document.body.className = "";
    };

    private init = () => {
        const { selectedAssetType, address } = this.props;
        this.props.fetchAssetSchemeIfNeed(new H160(selectedAssetType));
        this.props.fetchUTXOListIfNeed(address, new H160(selectedAssetType));
        this.props.fetchAvailableAssets(address);
        this.props.fetchWalletFromStorageIfNeed();
    };

    private handleSubmit = async (
        receivers: { address: string; quantity: U64 }[],
        memo: string,
        fee?: {
            payer: string;
            quantity: U64;
        } | null
    ) => {
        const { UTXOList } = this.props;
        const {
            t,
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

        const sumOfSendingAsset = _.reduce(
            receivers,
            (m, receiver) => U64.plus(m, receiver.quantity),
            new U64(0)
        );

        const inputUTXO = [];
        let inputUTXOSum = new U64(0);
        for (const utxo of UTXOList!) {
            inputUTXO.push(utxo);
            inputUTXOSum = U64.plus(inputUTXOSum, utxo.quantity);
            if (inputUTXOSum.gte(sumOfSendingAsset)) {
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
            (m, storedPlatformKey) => {
                return {
                    ...m,
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
            (m, storedAssetKey) => {
                return {
                    ...m,
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
                assetType: utxo.assetType,
                lockScriptHash: utxo.lockScriptHash,
                parameters: utxo.parameters,
                quantity: utxo.quantity,
                tracker: utxo.transactionTracker,
                transactionOutputIndex: utxo.transactionOutputIndex,
                orderHash: utxo.orderHash,
                shardId: utxo.shardId
            }).createTransferInput();
        });
        const outputData = _.map(receivers, receiver => {
            return {
                recipient: receiver.address,
                quantity: receiver.quantity,
                shardId: 0, // FIXME: Add a valid data
                assetType
            };
        });

        const refundAmount = U64.minus(inputUTXOSum, sumOfSendingAsset);
        if (refundAmount.gt(0)) {
            outputData.push({
                recipient: address,
                quantity: refundAmount,
                assetType,
                shardId: 0
            });
        }
        const outputs = _.map(
            outputData,
            o =>
                new AssetTransferOutput({
                    recipient: AssetTransferAddress.fromString(o.recipient),
                    quantity: o.quantity,
                    shardId: 0, // FIXME: Add a valid data
                    assetType: new H160(o.assetType)
                })
        );
        const transferTx = sdk.core.createTransferAssetTransaction({
            inputs: inputAssets,
            outputs,
            metadata: memo
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
                toast.error(t("send:asset.error.password.wrong"), {
                    position: toast.POSITION.BOTTOM_CENTER,
                    autoClose: 5000,
                    closeButton: false,
                    hideProgressBar: true
                });
            }
            console.log(e);
            return;
        }
        const metadata = Metadata.parseMetadata(assetScheme.metadata);

        this.setState({ isSendingTx: true });
        if (metadata.gateway && metadata.gateway.url) {
            try {
                await this.props.sendTransactionByGateway(
                    address,
                    transferTx,
                    metadata.gateway.url
                );
                this.setState({ isSentTx: true });
            } catch (e) {
                toast.error(t("send:asset.error.gateway.unauthorized"), {
                    position: toast.POSITION.BOTTOM_CENTER,
                    closeButton: false,
                    hideProgressBar: true,
                    autoClose: false
                });
                console.error(e);
            }
        } else {
            const feePayer = fee!.payer;
            const seq = await sdk.rpc.chain.getSeq(feePayer);
            const {
                transactions
            } = await sdk.rpc.chain.getPendingTransactions();
            const newSeq =
                seq +
                transactions.filter(
                    tx =>
                        tx.getSignerAddress({ networkId }).toString() ===
                        feePayer
                ).length;
            const signedTransaction = await sdk.key.signTransaction(
                transferTx,
                {
                    account: feePayer,
                    keyStore,
                    fee: fee!.quantity,
                    seq: newSeq,
                    passphrase
                }
            );
            try {
                await this.props.sendSignedTransaction(
                    address,
                    signedTransaction,
                    feePayer
                );
                this.setState({ isSentTx: true });
            } catch (e) {
                toast.error("Server is not responding.", {
                    position: toast.POSITION.BOTTOM_CENTER,
                    autoClose: 5000,
                    closeButton: false,
                    hideProgressBar: true
                });
                console.error(e);
            }
        }
        this.setState({ isSendingTx: false });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { selectedAssetType, address } = ownProps;
    const assetScheme =
        state.assetReducer.assetScheme[new H160(selectedAssetType).value];
    const id = getIdForCacheUTXO(address, new H160(selectedAssetType));
    const UTXOList = state.assetReducer.UTXOList[id];
    const availableAssets = state.assetReducer.availableAssets[address];
    const networkId = state.globalReducer.networkId;
    const passphrase = state.globalReducer.passphrase!;
    const assetAddresses = state.walletReducer.assetAddresses;
    const platformAddresses = state.walletReducer.platformAddresses;
    return {
        assetScheme: assetScheme && assetScheme.data,
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
    fetchAssetSchemeIfNeed: (assetType: H160) => {
        dispatch(assetActions.fetchAssetSchemeIfNeed(assetType));
    },
    fetchAvailableAssets: (address: string) => {
        dispatch(assetActions.fetchAvailableAssets(address));
    },
    sendTransactionByGateway: (
        address: string,
        transferTx: Transaction,
        gatewayURL: string
    ) => {
        return dispatch(
            chainActions.sendTransactionByGateway(
                address,
                transferTx,
                gatewayURL
            )
        );
    },
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction,
        feePayer: string
    ) => {
        return dispatch(
            chainActions.sendSignedTransaction(
                address,
                signedTransaction,
                feePayer
            )
        );
    },
    fetchUTXOListIfNeed: (address: string, assetType: H160) => {
        dispatch(assetActions.fetchUTXOListIfNeed(address, assetType));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(SendAsset));
