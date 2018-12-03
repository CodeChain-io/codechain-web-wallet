import * as React from "react";

import ValidationInput from "../../ValidationInput/ValidationInput";
import "./InputPassphrase.css";

interface State {
    passphrase: string;
    passphraseConfirm: string;
}

interface Props {
    onSubmit: (passphrase: string) => void;
}

class InputPassphrase extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            passphrase: "",
            passphraseConfirm: ""
        };
    }
    public render() {
        const { passphrase, passphraseConfirm } = this.state;
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
                    />
                </div>
                <div className="mt-5">
                    <button
                        className="btn btn-primary reverse square main-btn"
                        onClick={this.handleSubmit}
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    }

    private handleSubmit = () => {
        const { onSubmit } = this.props;
        const { passphrase, passphraseConfirm } = this.state;

        // TODO: Check passphrase
        if (passphrase !== passphraseConfirm) {
            return;
        }

        onSubmit(passphrase);
    };

    private handlePassphraseInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({ passphrase: event.target.value });
    };

    private handlePassphraseConfirmInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({ passphraseConfirm: event.target.value });
    };
}

export default InputPassphrase;
