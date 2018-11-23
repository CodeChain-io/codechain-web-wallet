import * as React from "react";
import ValidationInput from "../ValidationInput/ValidationInput";
import "./CreateWalletForm.css";

interface State {
    walletName: string;
    isValidWalletName?: boolean;
    nameError?: string | null;
}

export default class CreateWalletForm extends React.Component<any, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            walletName: "",
            isValidWalletName: undefined,
            nameError: undefined
        };
    }
    public render() {
        const { walletName, nameError, isValidWalletName } = this.state;
        return (
            <div className="Create-wallet-form">
                <h4>Create new wallet</h4>
                <div className="form-group wallet-name-container">
                    <div className="wallet-name-input">
                        <ValidationInput
                            onChange={this.handleWalletNameChange}
                            placeholder="Name"
                            labelText="WALLET NAME"
                            value={walletName}
                            reverse={true}
                            onBlur={this.checkWalletName}
                            error={nameError}
                            isValid={isValidWalletName}
                        />
                    </div>
                </div>
                <div className="wallet-address-list-container">
                    <span className="address-list-title">ADDRESS LIST</span>
                    <div className="add-address-paenl d-flex align-items-center justify-content-center">
                        <span className="font-weight-bold">ADD ADDRESS</span>
                    </div>
                </div>
            </div>
        );
    }
    private handleWalletNameChange = (event: any) => {
        this.setState({
            walletName: event.target.value,
            nameError: undefined,
            isValidWalletName: undefined
        });
    };
    private checkWalletName = (): boolean => {
        const { walletName } = this.state;
        if (walletName.trim().length === 0) {
            this.setState({
                nameError: "Required",
                isValidWalletName: false
            });
            return false;
        }
        this.setState({ isValidWalletName: true });
        return true;
    };
}
