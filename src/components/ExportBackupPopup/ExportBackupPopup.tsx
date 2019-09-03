import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import Form from "reactstrap/lib/Form";
import { checkPassphrase, exportMnemonic } from "../../model/keystore";
import ValidationInput from "../ValidationInput/ValidationInput";
import "./ExportBackupPopup.css";

interface Props {
    isOpen: boolean;
    toggle: () => void;
    className?: string;
}

interface State {
    passphrase: string;
    isValidPassphrase?: boolean;
    passphraseError?: string;
    revealBackupPhrase: boolean;
    backupPhraseString?: string | null;
}

class ExportBackupPopup extends React.Component<
    Props & WithTranslation,
    State
> {
    constructor(props: Props & WithTranslation) {
        super(props);
        this.state = {
            passphrase: "",
            isValidPassphrase: undefined,
            passphraseError: undefined,
            revealBackupPhrase: false,
            backupPhraseString: undefined
        };
    }
    public render() {
        const { className, toggle, isOpen, t } = this.props;
        const {
            passphrase,
            isValidPassphrase,
            passphraseError,
            revealBackupPhrase,
            backupPhraseString
        } = this.state;
        return (
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                className={`Export-backup-popup ${className}`}
                size="sm"
                centered={true}
            >
                <ModalHeader toggle={toggle}>
                    <Trans i18nKey="backup:title" />
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={this.handleOnFormSubmit}>
                        <div className="passphrase-container">
                            <div className="d-flex align-items-center justify-content-center passphrase-panel">
                                {backupPhraseString && [
                                    <span key="backup-phrase">
                                        {backupPhraseString}
                                    </span>,
                                    <CopyToClipboard
                                        key="copy"
                                        text={backupPhraseString}
                                        onCopy={this.handleCopyPhrase}
                                    >
                                        <div className="copy-btn">
                                            <span>COPY</span>
                                        </div>
                                    </CopyToClipboard>
                                ]}
                            </div>
                            {!revealBackupPhrase && (
                                <div className="d-flex align-items-center justify-content-center disable-panel">
                                    <span>
                                        <Trans i18nKey="backup:reveal" />
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <ValidationInput
                                onChange={this.handlePassphrase}
                                value={passphrase}
                                showValidation={true}
                                labelText={t("backup:password.label")}
                                placeholder={t("backup:password.placeholder")}
                                type="password"
                                isValid={isValidPassphrase}
                                error={passphraseError}
                                onBlur={this.checkPhrase}
                                disable={revealBackupPhrase}
                            />
                        </div>
                        <div className="mb-3">
                            <Button
                                color="primary square reverse w-100"
                                disabled={
                                    !passphrase ||
                                    isValidPassphrase === false ||
                                    revealBackupPhrase
                                }
                            >
                                <Trans i18nKey="backup:see_btn" />
                            </Button>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>
        );
    }
    private handleOnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.handleButtonClick();
    };
    private handlePassphrase = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            passphrase: event.target.value,
            isValidPassphrase: undefined,
            passphraseError: undefined
        });
    };
    private checkPhrase = async () => {
        const { passphrase } = this.state;
        const isValid = await checkPassphrase(passphrase);
        if (isValid) {
            this.setState({
                isValidPassphrase: true,
                passphraseError: undefined
            });
        } else {
            this.setState({
                isValidPassphrase: false,
                passphraseError: this.props.t("backup:password_error")
            });
        }
    };
    private handleButtonClick = async () => {
        const { passphrase } = this.state;
        if (!this.checkPhrase()) {
            return;
        }

        const backupPhraseString = await exportMnemonic(passphrase);
        this.setState({
            revealBackupPhrase: true,
            backupPhraseString
        });
    };
    private handleCopyPhrase = () => {
        toast.info(this.props.t("main:copied"), {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 1000,
            closeButton: false,
            hideProgressBar: true
        });
    };
}

export default withTranslation()(ExportBackupPopup);
