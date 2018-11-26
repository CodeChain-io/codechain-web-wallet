import * as _ from "lodash";
import * as React from "react";
import { AddressType } from "../../model/address";
import ValidationInput from "../ValidationInput/ValidationInput";
import "./CreateAddressForm.css";

interface Props {
    onCancel?: () => void;
    onSubmit: (
        type: AddressType,
        addressName: string,
        password: string,
        networkId: string
    ) => void;
}

interface State {
    type: AddressType;
    networkId: "cc" | "tc" | "sc" | "wc";
    name: string;
    password: string;
    passwordConfirm: string;

    nameError?: string | null;
    passwordError?: string | null;
    passwordConfirmError?: string | null;

    isNameValid?: boolean;
    isPasswordValid?: boolean;
    isPasswordConfirmValid?: boolean;
}

export default class CreateAddressForm extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            type: AddressType.Asset,
            name: "",
            password: "",
            passwordConfirm: "",
            networkId: "cc",
            nameError: undefined,
            passwordConfirmError: undefined,
            passwordError: undefined,
            isNameValid: undefined,
            isPasswordValid: undefined,
            isPasswordConfirmValid: undefined
        };
    }
    public render() {
        const {
            name,
            password,
            passwordConfirm,
            type,
            networkId,
            nameError,
            passwordConfirmError,
            passwordError,
            isNameValid,
            isPasswordConfirmValid,
            isPasswordValid
        } = this.state;
        const { onCancel } = this.props;
        return (
            <div className="Create-address-form">
                <h4 className="title">Add address</h4>
                <div>
                    <div className="input-container">
                        <div>
                            <span className="form-label">ADDRESS TYPE</span>
                        </div>
                        <div className="d-flex mt-2">
                            <div className="w-50 mr-1">
                                <button
                                    className={`btn btn-primary w-100 ${type ===
                                        AddressType.Asset && "selected"}`}
                                    onClick={_.partial(
                                        this.handleTypeChange,
                                        AddressType.Asset
                                    )}
                                >
                                    Asset
                                </button>
                            </div>
                            <div className="w-50 ml-1">
                                <button
                                    className={`btn btn-primary w-100 ${type ===
                                        AddressType.Platform && "selected"}`}
                                    onClick={_.partial(
                                        this.handleTypeChange,
                                        AddressType.Platform
                                    )}
                                >
                                    Platform
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="input-container">
                        <div>
                            <span className="form-label">NETWORK TYPE</span>
                        </div>
                        <div className="d-flex mt-2">
                            <div className="w-50 mr-1">
                                <button
                                    className={`btn btn-primary w-100 ${networkId ===
                                        "cc" && "selected"}`}
                                    onClick={_.partial(
                                        this.handleNetworkChange,
                                        "cc"
                                    )}
                                >
                                    MAINNET
                                </button>
                            </div>
                            <div className="w-50 ml-1">
                                <button
                                    disabled={networkId !== "cc"}
                                    className={`btn btn-primary w-100 ${networkId !==
                                        "cc" && "selected"}`}
                                    onClick={_.partial(
                                        this.handleNetworkChange,
                                        "tc"
                                    )}
                                >
                                    TESTNET
                                </button>
                            </div>
                        </div>
                        {networkId !== "cc" && (
                            <div className="d-flex mt-1">
                                <div className="ml-auto testnet-btn-container">
                                    <button
                                        className={`btn btn-primary mr-2 ${networkId ===
                                            "tc" && "selected"}`}
                                        onClick={_.partial(
                                            this.handleNetworkChange,
                                            "tc"
                                        )}
                                    >
                                        Husky
                                    </button>
                                    <button
                                        className={`btn btn-primary mr-2 ${networkId ===
                                            "sc" && "selected"}`}
                                        onClick={_.partial(
                                            this.handleNetworkChange,
                                            "sc"
                                        )}
                                    >
                                        Saluki
                                    </button>
                                    <button
                                        className={`btn btn-primary ${networkId ===
                                            "wc" && "selected"}`}
                                        onClick={_.partial(
                                            this.handleNetworkChange,
                                            "wc"
                                        )}
                                    >
                                        Corgi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="input-container">
                        <ValidationInput
                            labelText="ADDRESS NAME"
                            value={name}
                            placeholder="name"
                            onChange={this.handleNameChange}
                            error={nameError}
                            onBlur={this.checkNameField}
                            isValid={isNameValid}
                        />
                    </div>
                    <div className="input-container">
                        <ValidationInput
                            type="password"
                            labelText="PASSPHRASE"
                            value={password}
                            placeholder="password"
                            onChange={this.handlePasswordChange}
                            error={passwordError}
                            onBlur={this.checkPasswordField}
                            isValid={isPasswordValid}
                        />
                    </div>
                    <div className="input-container">
                        <ValidationInput
                            type="password"
                            labelText="PASSPHRASE CONFIRM"
                            value={passwordConfirm}
                            placeholder="passphrase confirm"
                            onChange={this.handlePasswordConfirmChange}
                            error={passwordConfirmError}
                            onBlur={this.checkPasswordConfirmField}
                            isValid={isPasswordConfirmValid}
                        />
                    </div>
                    <div className="d-flex cancel-add-btn-container">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className={`btn btn-primary square w-50 mr-1`}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={this.handleSubmit}
                            className={`btn btn-primary reverse square ${
                                onCancel ? "w-50 ml-1" : "w-100"
                            }`}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    private handleTypeChange = (addressType: AddressType) => {
        this.setState({
            type: addressType
        });
    };
    private handleNetworkChange = (networkId: "cc" | "tc" | "sc" | "wc") => {
        this.setState({
            networkId
        });
    };
    private handleNameChange = (event: any) => {
        this.setState({
            name: event.target.value,
            nameError: undefined,
            isNameValid: undefined
        });
    };
    private handlePasswordChange = (event: any) => {
        this.setState({
            password: event.target.value,
            passwordError: undefined,
            passwordConfirmError: undefined,
            isPasswordValid: undefined
        });
    };
    private handlePasswordConfirmChange = (event: any) => {
        this.setState({
            passwordConfirm: event.target.value,
            passwordError: undefined,
            passwordConfirmError: undefined,
            isPasswordConfirmValid: undefined
        });
    };
    private handleSubmit = (event: any) => {
        const { onSubmit } = this.props;
        const { password, name, type, networkId } = this.state;

        if (!this.checkNameField()) {
            return;
        }
        if (!this.checkPasswordField()) {
            return;
        }
        if (!this.checkPasswordConfirmField()) {
            return;
        }

        this.setState({
            type: AddressType.Asset,
            name: "",
            password: "",
            passwordConfirm: "",
            networkId: "cc",
            nameError: undefined,
            passwordConfirmError: undefined,
            passwordError: undefined,
            isNameValid: undefined,
            isPasswordValid: undefined,
            isPasswordConfirmValid: undefined
        });

        onSubmit(type, name.trim(), password, networkId);
    };

    private checkNameField = (): boolean => {
        const { name } = this.state;
        if (name.trim().length === 0) {
            this.setState({ nameError: "Required", isNameValid: false });
            return false;
        }
        if (name.length > 12) {
            this.setState({
                nameError: "Maximum length is 12 characters",
                isNameValid: false
            });
            return false;
        }
        this.setState({ isNameValid: true });
        return true;
    };

    private checkPasswordField = (): boolean => {
        const { password } = this.state;
        if (password.length < 8) {
            this.setState({
                passwordError: "Minimum length is 8 characters",
                isPasswordValid: false
            });
            return false;
        }
        this.setState({ isPasswordValid: true });
        return true;
    };

    private checkPasswordConfirmField = (): boolean => {
        const { password, passwordConfirm } = this.state;

        if (password !== passwordConfirm) {
            this.setState({
                passwordConfirmError: "Password does not match!",
                isPasswordConfirmValid: false
            });
            return false;
        }

        this.setState({ isPasswordConfirmValid: true });
        return true;
    };
}
