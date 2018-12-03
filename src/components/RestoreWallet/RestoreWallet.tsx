import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import ValidationInput from "../ValidationInput/ValidationInput";
import "./RestoreWallet.css";

interface State {
    passphrase: string;
    passphraseConfirm: string;
}

class RestoreWallet extends React.Component<any, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            passphrase: "",
            passphraseConfirm: ""
        };
    }
    public render() {
        const { passphrase, passphraseConfirm } = this.state;
        return (
            <Container className="Restore-wallet animated fadeIn">
                <div className="close-btn">
                    <Link to="/selectKeyfile">
                        <FontAwesomeIcon icon="times" className="icon" />
                    </Link>
                </div>
                <div className="restore-content">
                    <div className="title-container">
                        <h4 className="title">
                            Restore your wallet
                            <br />
                            using backup phrase
                        </h4>
                    </div>
                    <div className="description">
                        Enter your secret twelve word phrase here to restore
                        your wallet.
                    </div>
                    <div className="phrase-container">
                        <textarea className="phrase-input">
                            popular fence nominee wear north tattoo ethics
                            deputy raven obey junk guard
                        </textarea>
                    </div>
                    <div className="passphrase-input-container">
                        <ValidationInput
                            labelText="PASSPHRASE"
                            onChange={this.handlePassphraseInput}
                            value={passphrase}
                            showValidation={true}
                            placeholder="passphrase"
                            type="password"
                        />
                    </div>
                    <div className="passphrase-confirm-container">
                        <ValidationInput
                            labelText="PASSPHRASE CONFIRM"
                            onChange={this.handlePassphraseConfirmInput}
                            value={passphraseConfirm}
                            showValidation={true}
                            placeholder="passphrase confirm"
                            type="password"
                        />
                    </div>
                    <div className="main-btn-container">
                        <button
                            className="btn btn-primary reverse square main-btn"
                            onClick={this.handleSubmit}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </Container>
        );
    }

    private handleSubmit = () => {
        const { passphrase, passphraseConfirm } = this.state;

        // TODO: Check passphrase
        if (passphrase !== passphraseConfirm) {
            return;
        }
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
export default RestoreWallet;
