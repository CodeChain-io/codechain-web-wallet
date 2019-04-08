import { AggsUTXODoc, TransactionDoc } from "codechain-indexer-types";
import { U64 } from "codechain-sdk/lib/core/classes";
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
import AssetTxHistory from "../AssetTxHistory/AssetTxHistory";
import AssetItem from "./AssetItem/AssetItem";
import "./AssetList.css";
import * as Empty from "./img/cautiondisabled.svg";
import SendAsset from "./SendAsset/SendAsset";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    addressUTXOList?: AggsUTXODoc[] | null;
    pendingTxList?: TransactionDoc[] | null;
    availableAssets?:
        | {
              assetType: string;
              quantities: U64;
          }[]
        | null;
    networkId: NetworkId;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAggsUTXOListIfNeed: (address: string) => void;
    fetchPendingTxListIfNeed: (address: string) => void;
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
            this.setState({ selectedAssetType: undefined });
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
            availableAssets,
            networkId,
            addressName
        } = this.props;
        const { selectedAssetType } = this.state;
        if (!addressUTXOList || !pendingTxList || !availableAssets) {
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
                                <div className="asset-item-container">
                                    {availableAssets.length > 0 ? (
                                        _.map(
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
                                        )
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
                            </div>
                            <div className="element-container mb-3">
                                <h4 className="mb-3">Recent transactions</h4>
                                <AssetTxHistory address={address} />
                            </div>
                        </div>
                    </div>
                    {selectedAssetType && (
                        <div className="right-container">
                            <div className="right-panel">
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
        if (!selectedAssetType) {
            this.setState({
                selectedAssetType: assetType
            });
        } else if (selectedAssetType === assetType) {
            this.setState({
                selectedAssetType: undefined
            });
        } else {
            this.setState({
                selectedAssetType: undefined
            });
            setTimeout(() => {
                this.setState({ selectedAssetType: assetType });
            }, 100);
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
    const availableAssets = state.assetReducer.availableAssets[address];
    const networkId = state.globalReducer.networkId;
    const assetAddress = _.find(
        state.walletReducer.assetAddresses,
        aa => aa.address === address
    );
    return {
        addressUTXOList: aggsUTXOList && aggsUTXOList.data,
        pendingTxList: pendingTxList && pendingTxList.data,
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
