import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "reactstrap";
import Form from "reactstrap/lib/Form";
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
    username: string;
    isUsernameValid?: boolean;
    usernameError?: string;
}

interface DispatchProps {
    login: (passpharase: string) => Promise<void>;
    clearData: () => Promise<void>;
}

type Props = WithTranslation & RouteComponentProps & DispatchProps;
class RestoreWallet extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            secretPhrase: "",
            passphrase: "",
            passphraseConfirm: "",
            isPassphraseValid: undefined,
            passphraseError: undefined,
            isPassphraseConfirmValid: undefined,
            passphraseConfirmError: undefined,
            username: "",
            isUsernameValid: undefined,
            usernameError: undefined
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
        const { t } = this.props;
        const {
            passphrase,
            passphraseConfirm,
            isPassphraseConfirmValid,
            isPassphraseValid,
            passphraseConfirmError,
            passphraseError,
            secretPhrase,
            username,
            isUsernameValid,
            usernameError
        } = this.state;
        return (
            <Container className="Restore-wallet animated fadeIn">
                <div className="close-btn">
                    <Link to="/selectKeyfile">
                        <FontAwesomeIcon icon="times" className="icon" />
                    </Link>
                </div>
                <Form
                    className="restore-content"
                    onSubmit={this.handleOnFormSubmit}
                >
                    <div className="title-container">
                        <h4 className="title">
                            <Trans i18nKey="restore:title" />
                        </h4>
                    </div>
                    <div className="description">
                        <Trans i18nKey="restore:description" />
                    </div>
                    <div className="phrase-container">
                        <textarea
                            className="phrase-input"
                            value={secretPhrase}
                            onChange={this.handleChangeSecretPhraseInput}
                        />
                    </div>
                    <div className="username-input-container">
                        <ValidationInput
                            labelText={t("restore:name.label")}
                            onChange={this.handleUsernameInput}
                            value={username}
                            showValidation={true}
                            placeholder={t("restore:name.placeholder")}
                            type="text"
                            isValid={isUsernameValid}
                            error={usernameError}
                            onBlur={this.checkUsernameValid}
                        />
                    </div>
                    <div className="passphrase-input-container">
                        <ValidationInput
                            labelText={t("restore:password.label")}
                            onChange={this.handlePassphraseInput}
                            value={passphrase}
                            showValidation={true}
                            placeholder={t("restore:password.placeholder")}
                            type="password"
                            isValid={isPassphraseValid}
                            error={passphraseError}
                            onBlur={this.checkPassphraseValid}
                        />
                    </div>
                    <div className="passphrase-confirm-container">
                        <ValidationInput
                            labelText={t("restore:confirm.label")}
                            onChange={this.handlePassphraseConfirmInput}
                            value={passphraseConfirm}
                            showValidation={true}
                            placeholder={t("restore:confirm.placeholder")}
                            type="password"
                            isValid={isPassphraseConfirmValid}
                            error={passphraseConfirmError}
                            onBlur={this.checkPassphraseConfirm}
                        />
                    </div>
                    <div className="password-description">
                        <span>
                            <Trans i18nKey="restore:mnemonic.detail" />
                        </span>
                    </div>
                    <div className="main-btn-container">
                        <button
                            className="btn btn-primary reverse square main-btn"
                            type="submit"
                        >
                            {t("restore:ok")}
                        </button>
                    </div>
                </Form>
            </Container>
        );
    }

    private handleOnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.handleSubmit();
    };

    private handleSubmit = async () => {
        const { passphrase, username, secretPhrase } = this.state;
        const { t, login, history } = this.props;

        if (!this.checkUsernameValid()) {
            return;
        }

        if (!this.checkPassphraseValid()) {
            return;
        }

        if (!this.checkPassphraseConfirm()) {
            return;
        }
        const splitPassphrases = secretPhrase.match(/\S+/g);

        if (!splitPassphrases || splitPassphrases.length !== 12) {
            toast.error(t("restore:error.mnemonic.invalid"), {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
            return;
        }
        try {
            localStorage.setItem("USERNAME", username!);
            await importMnemonic(splitPassphrases.join(" "), passphrase);
            await login(passphrase!);
            history.push(`/`);
        } catch (e) {
            toast.error(t("restore:error.mnemonic.invalid"), {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
        }
    };

    private handleChangeSecretPhraseInput = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        this.setState({ secretPhrase: event.target.value });
    };

    private checkPassphraseValid = () => {
        const { t } = this.props;
        const { passphrase } = this.state;
        if (passphrase.length < 8) {
            this.setState({
                passphraseError: t("restore:error.password.minimum"),
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

    private checkUsernameValid = () => {
        const { t } = this.props;
        const { username } = this.state;
        if (username === "") {
            this.setState({
                isUsernameValid: false,
                usernameError: t("restore:error.name.required")
            });
            return false;
        }
        if (username.length > 20) {
            this.setState({
                usernameError: t("restore:error.name.maximum"),
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

    private handleUsernameInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            username: event.target.value,
            usernameError: undefined,
            isUsernameValid: undefined
        });
    };

    private checkPassphraseConfirm = () => {
        const { t } = this.props;
        const { passphrase, passphraseConfirm } = this.state;
        if (passphrase !== passphraseConfirm) {
            this.setState({
                passphraseConfirmError: t("restore:error.confirm.mismatch"),
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
            isPassphraseValid: undefined,
            passphraseConfirm: "",
            isPassphraseConfirmValid: undefined,
            passphraseConfirmError: undefined
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
        return dispatch(globalActions.login(passphrase));
    },
    clearData: () => {
        return dispatch(globalActions.clearData());
    }
});
export default connect(
    undefined,
    mapDispatchToProps
)(withTranslation()(withRouter(RestoreWallet)));
