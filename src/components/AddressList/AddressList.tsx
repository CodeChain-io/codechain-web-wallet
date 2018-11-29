import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

interface StateProps {
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
}
type Props = StateProps & DispatchProps;

class AddressList extends React.Component<Props, any> {
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
    }
    public render() {
        const { platformAddresses, assetAddresses } = this.props;
        return (
            <div className="Address-list">
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
                        </Row>
                    </div>
                </Container>
            </div>
        );
    }
}
const mapStateToProps = (state: ReducerConfigure) => ({
    platformAddresses: state.walletReducer.platformAddresses,
    assetAddresses: state.walletReducer.assetAddresses
});
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchWalletFromStorageIfNeed: () => {
        dispatch(actions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddressList);
