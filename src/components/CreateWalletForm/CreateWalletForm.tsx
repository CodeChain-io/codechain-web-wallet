import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import walletActions from "../../redux/wallet/walletActions";
import ValidationInput from "../ValidationInput/ValidationInput";
import CreatedAddressItem from "./CreatedAddressItem/CreatedAddressItem";
import "./CreateWalletForm.css";

interface StateProps {
    creatingAddresses?: WalletAddress[] | null;
    walletName?: string | null;
}
interface State {
    isValidWalletName?: boolean;
    nameError?: string | null;
}
interface DispatchProps {
    removeWalletAddress: (address: string) => void;
    updateWalletName: (name: string) => void;
}

type Props = DispatchProps & StateProps;
class CreateWalletForm extends React.Component<Props, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            isValidWalletName: undefined,
            nameError: undefined
        };
    }
    public render() {
        const { nameError, isValidWalletName } = this.state;
        const { creatingAddresses, walletName } = this.props;
        return (
            <div className="Create-wallet-form d-flex flex-column">
                <h4>Create new wallet</h4>
                <div className="wallet-name-container">
                    <div className="wallet-name-input">
                        <ValidationInput
                            className="mb-0"
                            onChange={this.handleWalletNameChange}
                            placeholder="name"
                            labelText="WALLET NAME"
                            value={walletName || ""}
                            reverse={true}
                            onBlur={this.checkWalletName}
                            error={nameError}
                            isValid={isValidWalletName}
                            showValidation={true}
                        />
                    </div>
                </div>
                <span className="address-list-title">ADDRESS LIST</span>
                <div className="wallet-address-list-container">
                    {(!creatingAddresses || creatingAddresses.length === 0) && (
                        <div className="add-address-button d-flex align-items-center justify-content-center">
                            <span className="font-weight-bold">
                                ADD ADDRESS
                            </span>
                        </div>
                    )}
                    {_.map(creatingAddresses, address => {
                        return (
                            <CreatedAddressItem
                                key={address.address}
                                data={address}
                                onRemove={this.handleRemoveAddress}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
    private handleWalletNameChange = (event: any) => {
        this.setState({
            nameError: undefined,
            isValidWalletName: undefined
        });
        this.props.updateWalletName(event.target.value);
    };
    private checkWalletName = (): boolean => {
        const { walletName } = this.props;
        if (!walletName || walletName.trim().length === 0) {
            this.setState({
                nameError: "Required",
                isValidWalletName: false
            });
            return false;
        }
        this.setState({ isValidWalletName: true });

        return true;
    };
    private handleRemoveAddress = (address: string) => {
        this.props.removeWalletAddress(address);
    };
}

const mapStateToProps = (state: ReducerConfigure) => {
    const creatingAddresses = state.walletReducer.creatingAddresses;
    const walletName = state.walletReducer.walletName;
    return {
        creatingAddresses,
        walletName
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    removeWalletAddress: (address: string) => {
        dispatch(walletActions.removeWalletAddress(address));
    },
    updateWalletName: (name: string) => {
        dispatch(walletActions.updateWalletName(name));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateWalletForm);
