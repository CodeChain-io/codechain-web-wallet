import * as React from "react";

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
}

interface Props {
    onSubmit: (passphrase: string) => void;
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
            isSubmitted: false
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
            isSubmitted
        } = this.state;
        return (
            <div className="Input-passphrase animated fadeIn">
                <div className="title-container">
                    <h4 className="title">
                        Create
                        <br />
                        New Wallet
                    </h4>
                </div>
                <div>
                    <ValidationInput
                        labelText="PASSPHRASE"
                        onChange={this.handlePassphraseInput}
                        value={passphrase}
                        showValidation={true}
                        placeholder="passphrase"
                        type="password"
                        isValid={isPassphraseValid}
                        error={passphraseError}
                        onBlur={this.checkPassphraseValid}
                    />
                </div>
                <div>
                    <ValidationInput
                        labelText="PASSPHRASE CONFIRM"
                        onChange={this.handlePassphraseConfirmInput}
                        value={passphraseConfirm}
                        showValidation={true}
                        placeholder="passphrase confirm"
                        type="password"
                        isValid={isPassphraseConfirmValid}
                        error={passphraseConfirmError}
                        onBlur={this.checkPassphraseConfirm}
                    />
                </div>
                <div className="mt-5">
                    <button
                        className="btn btn-primary reverse square main-btn"
                        onClick={this.handleSubmit}
                        disabled={isSubmitted}
                    >
                        {isSubmitted ? "CREATING..." : "OK"}
                    </button>
                </div>
            </div>
        );
    }

    private handleSubmit = () => {
        const { onSubmit } = this.props;
        const { passphrase } = this.state;

        if (!this.checkPassphraseValid()) {
            return;
        }

        if (!this.checkPassphraseConfirm()) {
            return;
        }

        this.setState({ isSubmitted: true });

        setTimeout(() => {
            onSubmit(passphrase);
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
}

export default InputPassphrase;
