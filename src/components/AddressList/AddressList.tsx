import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { WalletAddress } from "../../model/address";
import { getAssetAddresses, getPlatformAddresses } from "../../model/wallet";
import { IRootState } from "../../reducers";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

interface StateProps {
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
}

interface DispatchProps {
    updateWalletAddresses: (
        platformAddresses: WalletAddress[],
        assetAddresses: WalletAddress[]
    ) => void;
}
type Props = StateProps & DispatchProps;

class AddressList extends React.Component<Props, any> {
    public async componentDidMount() {
        const platformAddresses = await getPlatformAddresses();
        const assetAddresses = await getAssetAddresses();
        this.props.updateWalletAddresses(platformAddresses, assetAddresses);
    }
    public render() {
        const { platformAddresses, assetAddresses } = this.props;
        return (
            <div className="Address-list">
                <Container>
                    <div className="mt-3">
                        <h4>Platform Addresses</h4>
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
                    <div className="mt-3">
                        <h4>Asset Addresses</h4>
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
const mapStateToProps = (state: IRootState) => ({
    platformAddresses: state.platformAddresses,
    assetAddresses: state.assetAddresses
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    updateWalletAddresses: (
        walletAddresses: WalletAddress[],
        assetAddresses: WalletAddress[]
    ) => {
        dispatch(
            Actions.updateWalletAddresses(walletAddresses, assetAddresses)
        );
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddressList);
