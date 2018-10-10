import * as React from "react";
import { Form, Label } from "reactstrap";
import "./CreateWalletForm.css";

interface Props {
    onCancel: () => void;
    onSubmit: () => void;
}

export default class CreateWalletForm extends React.Component<Props, any> {
    public render() {
        const { onCancel, onSubmit } = this.props;
        return (
            <Form className="Create-wallet-form">
                <h4>Create new wallet</h4>
                <div className="form-group">
                    <Label for="wallet-name-input">Wallet name</Label>
                    <input
                        type="text"
                        className="form-control"
                        id="wallet-name-input"
                        aria-describedby="walletNameInput"
                        placeholder="Name"
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
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onSubmit}
                    >
                        Next
                    </button>
                </div>
            </Form>
        );
    }
}
