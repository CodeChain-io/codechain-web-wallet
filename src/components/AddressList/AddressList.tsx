import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import { Dispatch } from "redux";
import { WalletAddress } from "../../model/address";
import {
    getAssetAddresses,
    getPlatformAddresses,
    getWalletName
} from "../../model/wallet";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/actions";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

interface StateProps {
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
    walletName: string | undefined;
}

interface DispatchProps {
    updateWalletAddresses: (
        platformAddresses: WalletAddress[],
        assetAddresses: WalletAddress[]
    ) => void;
    updateWalletName: (walletName: string) => void;
}
type Props = StateProps & DispatchProps;

class AddressList extends React.Component<Props, any> {
    public async componentDidMount() {
        const platformAddresses = await getPlatformAddresses();
        const assetAddresses = await getAssetAddresses();
        const walletName = await getWalletName();
        this.props.updateWalletAddresses(platformAddresses, assetAddresses);
        this.props.updateWalletName(walletName);
    }
    public render() {
        const { platformAddresses, assetAddresses, walletName } = this.props;
        return (
            <div className="Address-list">
                <Container>
                    <div className="mt-5">
                        <h4>{walletName}</h4>
                    </div>
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
    assetAddresses: state.walletReducer.assetAddresses,
    walletName: state.walletReducer.walletName
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    updateWalletAddresses: (
        walletAddresses: WalletAddress[],
        assetAddresses: WalletAddress[]
    ) => {
        dispatch(
            actions.updateWalletAddresses(walletAddresses, assetAddresses)
        );
    },
    updateWalletName: (walletName: string) => {
        dispatch(actions.updateWalletName(walletName));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddressList);
