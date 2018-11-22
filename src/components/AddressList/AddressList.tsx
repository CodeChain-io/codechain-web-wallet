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
    fetchWalletFromStorage: () => void;
}
type Props = StateProps & DispatchProps;

class AddressList extends React.Component<Props, any> {
    public componentDidMount() {
        this.props.fetchWalletFromStorage();
    }
    public render() {
        const { platformAddresses, assetAddresses } = this.props;
        return (
            <div className="Address-list">
                <Container>
                    <div className="mt-5" />
                    <hr />
                    <div className="mt-3">
                        <h5>Platform Addresses</h5>
                        <Row>
                            {_.map(
                                platformAddresses,
                                (
                                    dummyAddress: WalletAddress,
                                    index: number
                                ) => (
                                    <Col xl={3} lg={4} sm={6} key={index}>
                                        <AddressItem address={dummyAddress} />
                                    </Col>
                                )
                            )}
                            <Col xl={3} lg={4} sm={6}>
                                <div className="add-address d-flex align-items-center justify-content-center">
                                    + Add address
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <hr />
                    <div className="mt-3">
                        <h5>Asset Addresses</h5>
                        <Row>
                            {_.map(
                                assetAddresses,
                                (
                                    dummyAddress: WalletAddress,
                                    index: number
                                ) => (
                                    <Col xl={3} lg={4} sm={6} key={index}>
                                        <AddressItem address={dummyAddress} />
                                    </Col>
                                )
                            )}
                            <Col xl={3} lg={4} sm={6}>
                                <div className="add-address d-flex align-items-center justify-content-center">
                                    + Add address
                                </div>
                            </Col>
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
    fetchWalletFromStorage: () => {
        dispatch(actions.fetchWalletFromStorage());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddressList);
