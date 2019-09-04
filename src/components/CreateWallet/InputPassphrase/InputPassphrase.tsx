import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";

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

interface OwnProps {
    onSubmit: (username: string, passphrase: string) => void;
}

type Props = WithTranslation & OwnProps;

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
        const { t } = this.props;
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
                        <Trans i18nKey="create:seed.title" />
                    </h4>
                </div>
                <div>
                    <ValidationInput
                        labelText={t("create:seed.name")}
                        onChange={this.handleUsernameInput}
                        value={username}
                        showValidation={true}
                        placeholder={t("create:seed.name")}
                        type="text"
                        isValid={isUsernameValid}
                        error={usernameError}
                        onBlur={this.checkUsernameValid}
                    />
                </div>
                <div>
                    <ValidationInput
                        labelText={t("create:seed.password")}
                        onChange={this.handlePassphraseInput}
                        value={passphrase}
                        showValidation={true}
                        placeholder={t("create:seed.password")}
                        type="password"
                        isValid={isPassphraseValid}
                        error={passphraseError}
                        onBlur={this.checkPassphraseValid}
                    />
                </div>
                <div>
                    <ValidationInput
                        labelText={t("create:seed.password_confirm")}
                        onChange={this.handlePassphraseConfirmInput}
                        value={passphraseConfirm}
                        showValidation={true}
                        placeholder={t("create:seed.password_confirm")}
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
                            <Trans i18nKey="create:seed.terms">
                                {/* eslint-disable-next-line */}
                                <a
                                    href={`${TermsOfConditionLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            </Trans>
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
                            <Trans i18nKey="create:seed.privacy">
                                {/* eslint-disable-next-line */}
                                <a
                                    href={`${PPLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            </Trans>
                        </label>
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        className="btn btn-primary reverse square main-btn"
                        disabled={isSubmitted || !hasAgreePP || !hasAgreeTOC}
                        type="submit"
                    >
                        {isSubmitted
                            ? t("create:seed.creating")
                            : t("create:seed.ok")}
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
                passphraseError: this.props.t("create:seed.error.pass_minimum"),
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
                passphraseConfirmError: this.props.t(
                    "create:seed.error.pass_mismatch"
                ),
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
                usernameError: this.props.t("create:seed.error.name_required")
            });
            return false;
        }
        if (username.length > 20) {
            this.setState({
                usernameError: this.props.t("create:seed.error.name_maximum"),
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
        this.setState({
            passphrase: event.target.value,
            passphraseConfirm: "",
            passphraseConfirmError: undefined,
            isPassphraseConfirmValid: undefined
        });
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

export default withTranslation()(InputPassphrase);
