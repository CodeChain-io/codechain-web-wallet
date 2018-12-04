import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Container } from "reactstrap";
import { ThunkDispatch } from "redux-thunk";
import { clearKeystore, importMnemonic } from "../../model/keystore";
import { ReducerConfigure } from "../../redux";
import globalActions, { Action } from "../../redux/global/globalActions";
import { clearPassphrase, clearWalletKeys } from "../../utils/storage";
import ValidationInput from "../ValidationInput/ValidationInput";
import "./RestoreWallet.css";

interface State {
    secretPhrase: string;
    passphrase: string;
    passphraseConfirm: string;
    isPassphraseValid?: boolean;
    passphraseError?: string;
    isPassphraseConfirmValid?: boolean;
    passphraseConfirmError?: string;
}

interface DispatchProps {
    login: (passpharase: string) => void;
    clearData: () => void;
}

type Props = RouteComponentProps & DispatchProps;
class RestoreWallet extends React.Component<Props, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            secretPhrase: "",
            passphrase: "",
            passphraseConfirm: "",
            isPassphraseValid: undefined,
            passphraseError: undefined,
            isPassphraseConfirmValid: undefined,
            passphraseConfirmError: undefined
        };
    }
    public async componentDidMount() {
        const { clearData } = this.props;
        clearPassphrase();
        clearData();
        clearWalletKeys();
        await clearKeystore();
    }
    public render() {
        const {
            passphrase,
            passphraseConfirm,
            isPassphraseConfirmValid,
            isPassphraseValid,
            passphraseConfirmError,
            passphraseError,
            secretPhrase
        } = this.state;
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
                        <textarea
                            className="phrase-input"
                            value={secretPhrase}
                            onChange={this.handleChangeSecretPhraseInput}
                        />
                    </div>
                    <div className="passphrase-input-container">
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
                    <div className="passphrase-confirm-container">
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

    private handleSubmit = async () => {
        const { passphrase, secretPhrase } = this.state;
        const { login, history } = this.props;

        if (!this.checkPassphraseValid()) {
            return;
        }

        if (!this.checkPassphraseConfirm()) {
            return;
        }
        const splitPassphrases = secretPhrase.match(/\S+/g);

        if (!splitPassphrases || splitPassphrases.length !== 12) {
            return;
        }

        await importMnemonic(splitPassphrases.join(" "), passphrase);
        login(passphrase!);
        history.push("/");
    };

    private handleChangeSecretPhraseInput = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        this.setState({ secretPhrase: event.target.value });
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

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: (passphrase: string) => {
        dispatch(globalActions.login(passphrase));
    },
    clearData: () => {
        dispatch(globalActions.clearData());
    }
});
export default connect(
    () => ({}),
    mapDispatchToProps
)(withRouter(RestoreWallet));
