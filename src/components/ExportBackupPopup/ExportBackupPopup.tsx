import * as React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
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

class ExportBackupPopup extends React.Component<Props, State> {
    constructor(props: Props) {
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
        const { className, toggle, isOpen } = this.props;
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
                <ModalHeader toggle={toggle}>Backup phrase</ModalHeader>
                <ModalBody>
                    <div className="passphrase-container">
                        <div className="d-flex align-items-center justify-content-center passphrase-panel">
                            <span>{backupPhraseString}</span>
                        </div>
                        {!revealBackupPhrase && (
                            <div className="d-flex align-items-center justify-content-center disable-panel">
                                <span>
                                    Enter your passphrase to reveal backup
                                    phrase.
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3">
                        <ValidationInput
                            onChange={this.handlePassphrase}
                            value={passphrase}
                            showValidation={true}
                            labelText="PASSPHRASE"
                            placeholder="passphrase"
                            type="password"
                            isValid={isValidPassphrase}
                            error={passphraseError}
                            onBlur={this.checkPhrase}
                            disable={revealBackupPhrase}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary square reverse w-100"
                        onClick={this.handleButtonClick}
                        disabled={
                            !passphrase ||
                            isValidPassphrase === false ||
                            revealBackupPhrase
                        }
                    >
                        SEE BACKUP PHRASE
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
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
                passphraseError: "invalid passphrase"
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
}

export default ExportBackupPopup;
