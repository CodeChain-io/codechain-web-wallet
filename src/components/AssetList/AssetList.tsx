import {
    AggsUTXO,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { MetadataFormat } from "codechain-indexer-types/lib/utils";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import assetActions from "../../redux/asset/assetActions";
import chainActions from "../../redux/chain/chainActions";
import walletActions from "../../redux/wallet/walletActions";
import AddressContainer from "../AddressContainer/AddressContainer";
import TxHistory from "../TxHistory/TxHistory";
import AssetItem from "./AssetItem/AssetItem";
import "./AssetList.css";
import * as Empty from "./img/cautiondisabled.svg";
import SendAsset from "./SendAsset/SendAsset";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    addressUTXOList?: AggsUTXO[] | null;
    pendingTxList?: PendingTransactionDoc[] | null;
    unconfirmedTxList?: TransactionDoc[] | null;
    availableAssets?:
        | {
              assetType: string;
              quantities: number;
              metadata: MetadataFormat;
          }[]
        | null;
    networkId: NetworkId;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAggsUTXOListIfNeed: (address: string) => void;
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchUnconfirmedTxListIfNeed: (address: string) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

interface State {
    selectedAssetType?: string | null;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetList extends React.Component<Props, State> {
    private refresher: any;
    public constructor(props: Props) {
        super(props);
        this.state = {
            selectedAssetType: undefined
        };
    }
    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            match: {
                params: { address: nextAddress }
            }
        } = props;
        if (nextAddress !== address) {
            this.init();
        }
    }

    public componentDidMount() {
        this.init();
    }

    public componentWillUnmount() {
        this.clearInterval();
    }

    public render() {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            addressUTXOList,
            pendingTxList,
            unconfirmedTxList,
            availableAssets,
            networkId,
            addressName
        } = this.props;
        const { selectedAssetType } = this.state;
        if (
            !addressUTXOList ||
            !pendingTxList ||
            !unconfirmedTxList ||
            !availableAssets
        ) {
            return null;
        }
        return (
            <div className="Asset-list animated fadeIn">
                <div className="d-flex">
                    <div className="left-panel mx-auto">
                        <AddressContainer
                            address={address}
                            backButtonPath="/"
                            addressName={addressName}
                        />
                        <div>
                            <div className="element-container mb-3">
                                <h4 className="mb-3">Asset list</h4>
                                {availableAssets.length > 0 ? (
                                    <div className="asset-item-container">
                                        {_.map(
                                            availableAssets,
                                            availableAsset => (
                                                <AssetItem
                                                    key={
                                                        availableAsset.assetType
                                                    }
                                                    assetType={
                                                        availableAsset.assetType
                                                    }
                                                    quantities={
                                                        availableAsset.quantities
                                                    }
                                                    metadata={
                                                        availableAsset.metadata
                                                    }
                                                    networkId={networkId}
                                                    address={address}
                                                    onSelect={
                                                        this.handleSelectAsset
                                                    }
                                                    isSelected={
                                                        selectedAssetType !==
                                                            undefined &&
                                                        selectedAssetType ===
                                                            availableAsset.assetType
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div>
                                            <div className="text-center mt-3">
                                                <img src={Empty} />
                                            </div>
                                            <div className="mt-3 empty">
                                                There is no asset
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="element-container mb-3">
                                <h4 className="mb-3">Recent transaction</h4>
                                <TxHistory address={address} />
                            </div>
                        </div>
                    </div>
                    {selectedAssetType && (
                        <div className="send-asset-container">
                            <div className="send-asset-panel">
                                <SendAsset
                                    address={address}
                                    selectedAssetType={selectedAssetType}
                                    onClose={this.handleSendAssetClose}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    private handleSendAssetClose = () => {
        this.setState({ selectedAssetType: undefined });
    };
    private handleSelectAsset = (assetType: string) => {
        const selectedAssetType = this.state.selectedAssetType;
        if (selectedAssetType === assetType) {
            this.setState({ selectedAssetType: undefined });
        } else {
            this.setState({ selectedAssetType: assetType });
        }
    };
    private init = async () => {
        this.clearInterval();
        this.refresher = setInterval(() => {
            this.fetchAll();
        }, 5000);
        this.fetchAll();
    };
    private clearInterval = () => {
        if (this.refresher) {
            clearInterval(this.refresher);
        }
    };
    private fetchAll = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchUnconfirmedTxListIfNeed(address);
        this.props.fetchPendingTxListIfNeed(address);
        this.props.fetchAggsUTXOListIfNeed(address);
        this.props.fetchAvailableAssets(address);
        this.props.fetchWalletFromStorageIfNeed();
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const aggsUTXOList = state.assetReducer.aggsUTXOList[address];
    const pendingTxList = state.chainReducer.pendingTxList[address];
    const unconfirmedTxList = state.chainReducer.unconfirmedTxList[address];
    const availableAssets = state.assetReducer.availableAssets[address];
    const networkId = state.globalReducer.networkId;
    const assetAddress = _.find(
        state.walletReducer.assetAddresses,
        aa => aa.address === address
    );
    return {
        addressUTXOList: aggsUTXOList && aggsUTXOList.data,
        pendingTxList: pendingTxList && pendingTxList.data,
        unconfirmedTxList: unconfirmedTxList && unconfirmedTxList.data,
        availableAssets,
        networkId,
        addressName: assetAddress && assetAddress.name
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAggsUTXOListIfNeed: (address: string) => {
        dispatch(assetActions.fetchAggsUTXOListIfNeed(address));
    },
    fetchPendingTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchPendingTxListIfNeed(address));
    },
    fetchUnconfirmedTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchUnconfirmedTxListIfNeed(address));
    },
    fetchAvailableAssets: (address: string) => {
        dispatch(assetActions.fetchAvailableAssets(address));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetList);
