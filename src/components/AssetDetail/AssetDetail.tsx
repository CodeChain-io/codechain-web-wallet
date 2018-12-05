import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Col, Row } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import assetActions from "../../redux/asset/assetActions";
import walletActions from "../../redux/wallet/walletActions";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import AddressContainer from "../AddressContainer/AddressContainer";
import TxHistory from "../TxHistory/TxHistory";
import "./AssetDetail.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
    networkId: NetworkId;
    availableAsset?: {
        assetType: string;
        quantities: number;
        metadata: MetadataFormat;
    } | null;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H256) => void;
    fetchAvailableAssets: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetDetail extends React.Component<Props, any> {
    public async componentDidMount() {
        this.init();
    }

    public render() {
        const {
            assetScheme,
            match: {
                params: { assetType, address }
            },
            networkId,
            availableAsset,
            addressName
        } = this.props;
        if (!assetScheme || !availableAsset) {
            return null;
        }

        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Asset-detail d-flex">
                <div className="panel mx-auto">
                    <AddressContainer
                        address={address}
                        backButtonPath={`/${address}/assets`}
                        addressName={addressName}
                    />
                    <div className="detail-history-container">
                        <h4 className="mr-auto">Asset detail</h4>
                        <div className="d-flex mt-4 mb-4 align-itmes-center">
                            <ImageLoader
                                className="asset-image"
                                data={assetType}
                                size={65}
                                isAssetImage={true}
                                networkId={networkId}
                            />
                            <div className="ml-4 name-quantity-container">
                                <h4 className="mb-0">
                                    {metadata.name || "None"}
                                </h4>
                                <div className="mono asset-type">
                                    0x
                                    {new H256(assetType).value}
                                </div>
                                <div>
                                    <span className="total-text mr-3">
                                        Total
                                    </span>
                                    <span className="quantity-text number">
                                        {availableAsset.quantities.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div className="info-container">
                            <Row>
                                <Col md={2}>Description</Col>
                                <Col md={10}>
                                    {metadata.description || "None"}
                                </Col>
                            </Row>
                            <Row>
                                <Col md={2}>Registrar</Col>
                                <Col md={10}>
                                    {assetScheme.registrar || "None"}
                                </Col>
                            </Row>
                            <Row>
                                <Col md={2}>Total supply</Col>
                                <Col md={10}>{assetScheme.amount}</Col>
                            </Row>
                        </div>
                        <h4 className="mb-3">Transaction history</h4>
                        <TxHistory address={address} />
                    </div>
                </div>
            </div>
        );
    }

    private init = () => {
        const {
            match: {
                params: { assetType, address }
            }
        } = this.props;
        this.props.fetchAssetSchemeIfNeed(new H256(assetType));
        this.props.fetchAvailableAssets(address);
        this.props.fetchWalletFromStorageIfNeed();
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
    const networkId = state.globalReducer.networkId;
    const availableAssets = state.assetReducer.availableAssets[address];
    const availableAsset = _.find(
        availableAssets,
        asset => asset.assetType === new H256(assetType).value
    );
    const assetAddress = _.find(
        state.walletReducer.assetAddresses,
        aa => aa.address === address
    );
    return {
        assetScheme: assetScheme && assetScheme.data,
        networkId,
        availableAsset,
        addressName: assetAddress && assetAddress.name
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
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetDetail);
