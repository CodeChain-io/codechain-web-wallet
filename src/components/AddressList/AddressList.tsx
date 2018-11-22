import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
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
                    <div className="mt-3 mb-5">
                        <div className="deco platform-title-deco" />
                        <h5 className="mb-4">Platform Addresses</h5>
                        <div className="address-item-container">
                            {_.map(
                                platformAddresses,
                                (
                                    dummyAddress: WalletAddress,
                                    index: number
                                ) => (
                                    <AddressItem
                                        key={index}
                                        walletAddress={dummyAddress}
                                    />
                                )
                            )}
                        </div>
                    </div>
                    <hr />
                    <div className="mt-3">
                        <div className="deco asset-title-deco" />
                        <h5 className="mb-4">Asset Addresses</h5>
                        <div className="address-item-container">
                            {_.map(
                                assetAddresses,
                                (
                                    dummyAddress: WalletAddress,
                                    index: number
                                ) => (
                                    <AddressItem
                                        key={index}
                                        walletAddress={dummyAddress}
                                    />
                                )
                            )}
                        </div>
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
