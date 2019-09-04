import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

interface StateProps {
    platformAddresses?: WalletAddress[] | null;
    assetAddresses?: WalletAddress[] | null;
    networkId: NetworkId;
    isLoadingAssetAddresses?: boolean | null;
    isLoadingPlatformAddresses?: boolean | null;
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
    createWalletAssetAddress: () => void;
    createWalletPlatformAddress: () => void;
}
type Props = WithTranslation & StateProps & DispatchProps;

class AddressList extends React.Component<Props> {
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
    }
    public componentWillReceiveProps(props: Props) {
        const { networkId } = this.props;
        const { networkId: nextNetworkId } = props;
        if (networkId !== nextNetworkId) {
            this.props.fetchWalletFromStorageIfNeed();
        }
    }
    public render() {
        const { platformAddresses, assetAddresses, networkId } = this.props;
        return (
            <div className="Address-list animated fadeIn">
                <Container>
                    <div className="asset-address-container mb-5">
                        <div className="deco asset-title-deco" />
                        <h5 className="mb-1">
                            <Trans i18nKey="main:asset.title" />
                        </h5>
                        <div className="mb-4 address-description">
                            <span>
                                <Trans i18nKey="main:asset.detail" />
                            </span>
                        </div>
                        <Row className="address-item-container">
                            {_.map(assetAddresses, (address, index: number) => (
                                <Col md={6} lg={4} xl={3} key={index}>
                                    <AddressItem walletAddress={address} />
                                </Col>
                            ))}
                            <Col md={6} lg={4} xl={3}>
                                {!assetAddresses ? (
                                    <div className="restoring">
                                        <Trans i18nKey="main:asset.restore" />
                                    </div>
                                ) : (
                                    <div>
                                        <div
                                            onClick={this.createAssetAddress}
                                            className="add-address-btn d-flex align-items-center justify-content-center"
                                        >
                                            <Trans i18nKey="main:asset.add" />
                                            <FontAwesomeIcon
                                                className="ml-2"
                                                icon="plus-circle"
                                            />
                                        </div>
                                        {assetAddresses.length > 0 && (
                                            <Link to="/mint">
                                                <div className="mint-asset-btn d-flex align-items-center justify-content-center">
                                                    <Trans i18nKey="main:asset.mint" />
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                    <hr />
                    <div className="platform-address-container">
                        <div className="deco platform-title-deco" />
                        <h5 className="mb-1">
                            <Trans i18nKey="main:ccc.title" />
                        </h5>
                        <div className="mb-4 address-description">
                            <span>
                                <Trans i18nKey="main:ccc.detail" />
                            </span>
                        </div>
                        <Row className="address-item-container">
                            {_.map(
                                platformAddresses,
                                (address, index: number) => (
                                    <Col md={6} lg={4} xl={3} key={index}>
                                        <AddressItem walletAddress={address} />
                                    </Col>
                                )
                            )}
                            <Col md={6} lg={4} xl={3}>
                                {!platformAddresses ? (
                                    <div className="restoring">
                                        <Trans i18nKey="main:ccc.restore" />
                                    </div>
                                ) : (
                                    <div>
                                        <div
                                            onClick={this.createPlatformAddress}
                                            className="add-address-btn d-flex align-items-center justify-content-center"
                                        >
                                            <Trans i18nKey="main:ccc.add" />
                                            <FontAwesomeIcon
                                                className="ml-2"
                                                icon="plus-circle"
                                            />
                                        </div>
                                        {platformAddresses.length > 0 &&
                                            (networkId === "wc" && (
                                                <a
                                                    href="https://corgi.codechain.io/faucet"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <div className="buy-CCC-btn d-flex align-items-center justify-content-center">
                                                        <Trans i18nKey="main:ccc.faucet" />
                                                    </div>
                                                </a>
                                            ))}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        );
    }
    private createPlatformAddress = async () => {
        const { createWalletPlatformAddress } = this.props;
        createWalletPlatformAddress();
    };

    private createAssetAddress = async () => {
        const { createWalletAssetAddress } = this.props;
        createWalletAssetAddress();
    };
}
const mapStateToProps = (state: ReducerConfigure) => ({
    platformAddresses: state.walletReducer.platformAddresses,
    assetAddresses: state.walletReducer.assetAddresses,
    networkId: state.globalReducer.networkId,
    isLoadingAssetAddresses: state.walletReducer.isLoadingAssetAddresses,
    isLoadingPlatformAddresses: state.walletReducer.isLoadingPlatformAddresses
});
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchWalletFromStorageIfNeed: () => {
        dispatch(actions.fetchWalletFromStorageIfNeed());
    },
    createWalletPlatformAddress: () => {
        dispatch(actions.createWalletPlatformAddress());
    },
    createWalletAssetAddress: () => {
        dispatch(actions.createWalletAssetAddress());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(AddressList));
