import * as React from "react";
import { Form, Label } from "reactstrap";
import "./CreateAddressForm.css";

interface Props {
    onCancel: () => void;
    onSubmit: (
        type: "Platform" | "Asset",
        addressName: string,
        password: string
    ) => void;
}

interface State {
    type: "Platform" | "Asset";
    name: string;
    password: string;
    passwordConfirm: string;
}

export default class CreateAddressForm extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            type: "Asset",
            name: "",
            password: "",
            passwordConfirm: ""
        };
    }
    public render() {
        const { onCancel } = this.props;
        const { type, name, password, passwordConfirm } = this.state;
        return (
            <Form onSubmit={this.handleSubmit} className="Create-address-form">
                <div className="form-group">
                    <legend className="col-form-label pt-0">
                        Address type
                    </legend>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="addressType"
                            id="asset-address-radio"
                            value="Asset"
                            checked={type === "Asset"}
                            onChange={this.handleTypeChange}
                        />
                        <Label
                            className="form-check-label"
                            for="asset-address-radio"
                        >
                            Asset Address
                        </Label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="addressType"
                            id="platform-address-radio"
                            value="Platform"
                            checked={type === "Platform"}
                            onChange={this.handleTypeChange}
                        />
                        <Label
                            className="form-check-label"
                            for="platform-address-radio"
                        >
                            Platform Address
                        </Label>
                    </div>
                </div>
                <div className="form-group">
                    <Label for="address-name-input">Address name</Label>
                    <input
                        required={true}
                        type="text"
                        className="form-control"
                        id="address-name-input"
                        aria-describedby="AddressNameInput"
                        placeholder="Name"
                        value={name}
                        onChange={this.handleNameChange}
                        minLength={4}
                    />
                </div>
                <div className="form-group">
                    <Label for="address-password-input">Password</Label>
                    <input
                        type="password"
                        className="form-control"
                        id="address-password-input"
                        placeholder="Password"
                        value={password}
                        onChange={this.handlePasswordChange}
                        required={true}
                        minLength={8}
                    />
                </div>
                <div className="form-group">
                    <Label for="address-confirm-password-input">
                        Confirm password
                    </Label>
                    <input
                        type="password"
                        className="form-control"
                        id="address-confirm-password-input"
                        placeholder="Confirm password"
                        value={passwordConfirm}
                        onChange={this.handlePasswordConfirmChange}
                        required={true}
                        minLength={8}
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
                        Add
                    </button>
                </div>
            </Form>
        );
    }

    private handleTypeChange = (event: any) => {
        this.setState({
            type: event.target.value
        });
    };

    private handleNameChange = (event: any) => {
        this.setState({
            name: event.target.value
        });
    };

    private handlePasswordChange = (event: any) => {
        this.setState({
            password: event.target.value
        });
    };
    private handlePasswordConfirmChange = (event: any) => {
        this.setState({
            passwordConfirm: event.target.value
        });
    };
    private handleSubmit = (event: any) => {
        event.preventDefault();
        const { onSubmit } = this.props;
        const { password, passwordConfirm, name, type } = this.state;

        if (password !== passwordConfirm) {
            alert("Password does not match!");
            return;
        }

        onSubmit(type, name, password);
    };
}
