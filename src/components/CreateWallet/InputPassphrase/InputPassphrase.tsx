import * as React from "react";

import { Form } from "reactstrap";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./InputPassphrase.css";

interface State {
    passphrase: string;
    passphraseConfirm: string;
    isPassphraseValid?: boolean;
    passphraseError?: string;
    isPassphraseConfirmValid?: boolean;
    passphraseConfirmError?: string;
    isSubmitted: boolean;
    username: string;
    isUsernameValid?: boolean;
    usernameError?: string;
    hasAgreeTOC: boolean;
    hasAgreePP: boolean;
}

const TermsOfConditionLink =
    "https://docs.google.com/document/d/1-HJep6vXMaiX4p62ijIfAc9yyX_rKAFkFLPsMod8tl0/edit?usp=sharing";
const PPLink =
    "https://docs.google.com/document/d/13Bonpgp2Va4dDlAIzvH2JSKFyOBlSSUrvFQ_PE2YqWI/edit?usp=sharing";

interface Props {
    onSubmit: (username: string, passphrase: string) => void;
}

class InputPassphrase extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            passphrase: "",
            passphraseConfirm: "",
            isPassphraseValid: undefined,
            passphraseError: undefined,
            isPassphraseConfirmValid: undefined,
            passphraseConfirmError: undefined,
            isSubmitted: false,
            username: "",
            isUsernameValid: undefined,
            usernameError: undefined,
            hasAgreeTOC: false,
            hasAgreePP: false
        };
    }
    public render() {
        const {
            passphrase,
            passphraseConfirm,
            isPassphraseConfirmValid,
            isPassphraseValid,
            passphraseConfirmError,
            passphraseError,
            isSubmitted,
            username,
            isUsernameValid,
            usernameError,
            hasAgreeTOC,
            hasAgreePP
        } = this.state;
        return (
            <Form
                className="Input-passphrase animated fadeIn"
                onSubmit={this.handleOnFormSubmit}
            >
                <div className="title-container">
                    <h4 className="title">
                        Create
                        <br />
                        New Wallet
                    </h4>
                </div>
                <div>
                    <ValidationInput
                        labelText="USERNAME"
                        onChange={this.handleUsernameInput}
                        value={username}
                        showValidation={true}
                        placeholder="username"
                        type="text"
                        isValid={isUsernameValid}
                        error={usernameError}
                        onBlur={this.checkUsernameValid}
                    />
                </div>
                <div>
                    <ValidationInput
                        labelText="PASSWORD"
                        onChange={this.handlePassphraseInput}
                        value={passphrase}
                        showValidation={true}
                        placeholder="password"
                        type="password"
                        isValid={isPassphraseValid}
                        error={passphraseError}
                        onBlur={this.checkPassphraseValid}
                    />
                </div>
                <div>
                    <ValidationInput
                        labelText="PASSWORD CONFIRM"
                        onChange={this.handlePassphraseConfirmInput}
                        value={passphraseConfirm}
                        showValidation={true}
                        placeholder="password confirm"
                        type="password"
                        isValid={isPassphraseConfirmValid}
                        error={passphraseConfirmError}
                        onBlur={this.checkPassphraseConfirm}
                    />
                </div>
                <div className="form-container">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="tocCheck"
                            checked={hasAgreeTOC}
                            onChange={this.handleTOCClick}
                        />
                        <label className="form-check-label" htmlFor="tocCheck">
                            I have read and agree to
                            {"  "}
                            <a href={`${TermsOfConditionLink}`} target="_blank">
                                Terms and Conditions
                            </a>
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="ppCheck"
                            checked={hasAgreePP}
                            onChange={this.handlePPClick}
                        />
                        <label className="form-check-label" htmlFor="ppCheck">
                            I have read and agree to
                            {"  "}
                            <a href={`${PPLink}`} target="_blank">
                                Privacy Policy
                            </a>
                        </label>
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        className="btn btn-primary reverse square main-btn"
                        disabled={isSubmitted || !hasAgreePP || !hasAgreeTOC}
                        type="submit"
                    >
                        {isSubmitted ? "CREATING..." : "OK"}
                    </button>
                </div>
            </Form>
        );
    }

    private handleTOCClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasAgreeTOC: event.target.checked
        });
    };

    private handlePPClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            hasAgreePP: event.target.checked
        });
    };

    private handleOnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.handleSubmit();
    };

    private handleSubmit = () => {
        const { onSubmit } = this.props;
        const { passphrase, username } = this.state;
        if (!this.checkUsernameValid()) {
            return;
        }
        if (!this.checkPassphraseValid()) {
            return;
        }
        if (!this.checkPassphraseConfirm()) {
            return;
        }

        this.setState({ isSubmitted: true });

        setTimeout(() => {
            onSubmit(username, passphrase);
        }, 500);
    };

    private checkPassphraseValid = () => {
        const { passphrase } = this.state;
        if (passphrase.length < 8) {
            this.setState({
                passphraseError: "Minimum length is 8 characters",
                isPassphraseValid: false
            });
            return false;
        }

        this.setState({
            passphraseError: undefined,
            isPassphraseValid: true
        });
        return true;
    };

    private checkPassphraseConfirm = () => {
        const { passphrase, passphraseConfirm } = this.state;
        if (passphrase !== passphraseConfirm) {
            this.setState({
                passphraseConfirmError: "Password does not match!",
                isPassphraseConfirmValid: false
            });
            return false;
        }

        this.setState({
            passphraseConfirmError: undefined,
            isPassphraseConfirmValid: true
        });
        return true;
    };

    private checkUsernameValid = () => {
        const { username } = this.state;
        if (username === "") {
            this.setState({
                isUsernameValid: false,
                usernameError: "username is required"
            });
            return false;
        }
        if (username.length > 20) {
            this.setState({
                usernameError: "Maximum length is 20 characters",
                isUsernameValid: false
            });
            return false;
        }
        this.setState({
            isUsernameValid: true,
            usernameError: undefined
        });
        return true;
    };

    private handlePassphraseInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            passphraseError: undefined,
            isPassphraseValid: undefined
        });
        this.setState({ passphrase: event.target.value });
    };

    private handlePassphraseConfirmInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            passphraseConfirmError: undefined,
            isPassphraseConfirmValid: undefined
        });
        this.setState({ passphraseConfirm: event.target.value });
    };

    private handleUsernameInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            username: event.target.value,
            usernameError: undefined,
            isUsernameValid: undefined
        });
    };
}

export default InputPassphrase;
