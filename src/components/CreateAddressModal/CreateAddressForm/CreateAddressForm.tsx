import * as React from "react";
import { Form, Label } from "reactstrap";
import "./CreateAddressForm.css";

interface Props {
    onCancel: () => void;
    onSubmit: () => void;
}

export default class CreateAddressForm extends React.Component<Props, any> {
    public render() {
        const { onCancel, onSubmit } = this.props;
        return (
            <Form className="Create-address-form">
                <h4>Create new address</h4>
                <div className="form-group">
                    <Label for="address-name-input">Address name</Label>
                    <input
                        type="text"
                        className="form-control"
                        id="address-name-input"
                        aria-describedby="AddressNameInput"
                        placeholder="Name"
                    />
                </div>
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
                            value="AssetAddress"
                            defaultChecked={true}
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
                            value="PlatformAddress"
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
                    <Label for="address-password-input">Password</Label>
                    <input
                        type="password"
                        className="form-control"
                        id="address-password-input"
                        placeholder="Password"
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
                        Create
                    </button>
                </div>
            </Form>
        );
    }
}
