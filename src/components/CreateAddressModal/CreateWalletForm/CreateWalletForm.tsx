import * as React from "react";
import { Form, Label } from "reactstrap";
import "./CreateWalletForm.css";

interface Props {
    onCancel: () => void;
    onSubmit: (walletName: string) => void;
}

interface State {
    walletName: string;
}

export default class CreateWalletForm extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            walletName: ""
        };
    }
    public render() {
        const { onCancel } = this.props;
        const { walletName } = this.state;
        return (
            <Form onSubmit={this.handleSumbit} className="Create-wallet-form">
                <h4>Create new wallet</h4>
                <div className="form-group">
                    <Label for="wallet-name-input">Wallet name</Label>
                    <input
                        type="text"
                        className={`form-control`}
                        id="wallet-name-input"
                        aria-describedby="walletNameInput"
                        placeholder="Name"
                        value={walletName}
                        onChange={this.handleWalletNameChange}
                        required={true}
                        minLength={4}
                    />
                </div>
                <div className="d-flex button-container">
                    <button
                        type="button"
                        className="btn btn-secondary ml-auto mr-3"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Next
                    </button>
                </div>
            </Form>
        );
    }

    private handleSumbit = async (event: any) => {
        event.preventDefault();
        if (!this.state.walletName) {
            return;
        }
        this.props.onSubmit(this.state.walletName);
    };

    private handleWalletNameChange = (event: any) => {
        this.setState({ walletName: event.target.value });
    };
}
