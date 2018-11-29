import {
    AggsUTXO,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { MetadataFormat } from "codechain-indexer-types/lib/utils";
import * as _ from "lodash";
import * as QRCode from "qrcode.react";
import * as React from "react";
import { connect } from "react-redux";
import MediaQuery from "react-responsive";
import { match } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import assetActions from "../../redux/asset/assetActions";
import chainActions from "../../redux/chain/chainActions";
import TxHistory from "../TxHistory/TxHistory";
import AssetItem from "./AssetItem/AssetItem";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./AssetList.css";
import * as copyBtnHover from "./img/copy-hover.svg";
import * as copyBtn from "./img/copy.svg";
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
}

interface DispatchProps {
    fetchAggsUTXOListIfNeed: (address: string) => void;
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchUnconfirmedTxListIfNeed: (address: string) => void;
    fetchAvailableAssets: (address: string) => void;
}

interface State {
    isCopyHovering: boolean;
    selectedAssetType?: string | null;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetList extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCopyHovering: false,
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
            networkId
        } = this.props;
        const { isCopyHovering, selectedAssetType } = this.state;
        if (
            !addressUTXOList ||
            !pendingTxList ||
            !unconfirmedTxList ||
            !availableAssets
        ) {
            return null;
        }
        return (
            <div className="Asset-list">
                <div className="d-flex">
                    <div className="left-panel mx-auto">
                        <div className="address-container d-flex align-items-center">
                            <Link to="/">
                                <FontAwesomeIcon
                                    className="back-btn"
                                    icon="arrow-left"
                                />
                            </Link>
                            <div className="qr-container">
                                <QRCode value={address} size={57} />
                            </div>
                            <div className="ml-3 name-address-container">
                                <h2 className="mb-0">Address1</h2>
                                <span className="mono address-text mr-3">
                                    <MediaQuery query="(max-width: 768px)">
                                        {address.slice(0, 8)}
                                        ...
                                        {address.slice(
                                            address.length - 8,
                                            address.length
                                        )}
                                    </MediaQuery>
                                    <MediaQuery query="(min-width: 769px)">
                                        {address}
                                    </MediaQuery>
                                </span>
                                <CopyToClipboard
                                    text={address}
                                    onCopy={this.handleCopyAddress}
                                >
                                    <img
                                        className="copy-btn"
                                        src={
                                            isCopyHovering
                                                ? copyBtnHover
                                                : copyBtn
                                        }
                                        onMouseOver={this.hoverCopyBtn}
                                        onMouseOut={this.outCopyBtn}
                                        onBlur={this.outCopyBtn}
                                    />
                                </CopyToClipboard>
                            </div>
                        </div>
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
                                        )
                                    ) : (
                                        <span>Empty</span>
                                    )}
                                </div>
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
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchUnconfirmedTxListIfNeed(address);
        this.props.fetchPendingTxListIfNeed(address);
        this.props.fetchAggsUTXOListIfNeed(address);
        this.props.fetchAvailableAssets(address);
    };

    private hoverCopyBtn = () => {
        this.setState({ isCopyHovering: true });
    };
    private outCopyBtn = () => {
        this.setState({ isCopyHovering: false });
    };
    private handleCopyAddress = () => {
        toast.info("Copied!", {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 3000
        });
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
    return {
        addressUTXOList: aggsUTXOList && aggsUTXOList.data,
        pendingTxList: pendingTxList && pendingTxList.data,
        unconfirmedTxList: unconfirmedTxList && unconfirmedTxList.data,
        availableAssets,
        networkId
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
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetList);
