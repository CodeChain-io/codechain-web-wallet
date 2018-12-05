import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

interface StateProps {
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
    networkId: NetworkId;
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
    createWalletAssetAddress: () => void;
    createWalletPlatformAddress: () => void;
}
type Props = StateProps & DispatchProps;

class AddressList extends React.Component<Props, any> {
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
        const { platformAddresses, assetAddresses } = this.props;
        return (
            <div className="Address-list animated fadeIn">
                <Container>
                    <div className="asset-address-container mb-5">
                        <div className="deco asset-title-deco" />
                        <h5 className="mb-4">Asset Addresses</h5>
                        <Row className="address-item-container">
                            {_.map(assetAddresses, (address, index: number) => (
                                <Col md={6} lg={4} xl={3} key={index}>
                                    <AddressItem walletAddress={address} />
                                </Col>
                            ))}
                            <Col md={6} lg={4} xl={3}>
                                <div
                                    onClick={this.createAssetAddress}
                                    className="add-address-btn asset d-flex align-items-center justify-content-center"
                                >
                                    ADD ADDRESS
                                    <FontAwesomeIcon
                                        className="ml-2"
                                        icon="plus-circle"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <hr />
                    <div className="platform-address-container">
                        <div className="deco platform-title-deco" />
                        <h5 className="mb-4">Platform Addresses</h5>
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
                                <div
                                    onClick={this.createPlatformAddress}
                                    className="add-address-btn platform d-flex align-items-center justify-content-center"
                                >
                                    ADD ADDRESS
                                    <FontAwesomeIcon
                                        className="ml-2"
                                        icon="plus-circle"
                                    />
                                </div>
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
    networkId: state.globalReducer.networkId
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
)(AddressList);
