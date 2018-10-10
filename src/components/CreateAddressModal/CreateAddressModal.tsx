import * as React from "react";
import * as Modal from "react-modal";
import CreateAddressForm from "./CreateAddressForm/CreateAddressForm";
import "./CreateAddressModal.css";
import CreateWalletForm from "./CreateWalletForm/CreateWalletForm";
import DownloadWalletForm from "./DownloadWalletForm/DownloadWalletForm";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)"
    },
    overlay: {
        backgroundColor: "rgba(0,0,0,0.7)"
    }
};

enum InputForm {
    CreateWallet,
    CreateAddress,
    DownloadWallet
}

interface Props {
    onClose: () => void;
    isOpen: boolean;
}

interface State {
    currentInputForm: InputForm;
}

export default class CreateAddressModal extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            currentInputForm: InputForm.CreateWallet
        };
    }

    public render() {
        const { isOpen, onClose } = this.props;
        const { currentInputForm } = this.state;
        return (
            <div>
                <Modal
                    isOpen={isOpen}
                    onRequestClose={onClose}
                    style={customStyles}
                    shouldCloseOnEsc={false}
                    shouldCloseOnOverlayClick={false}
                    contentLabel="Create wallet popup"
                >
                    <div className="Create-address-modal">
                        {currentInputForm === InputForm.CreateWallet && (
                            <CreateWalletForm
                                onCancel={this.handleCancelButton}
                                onSubmit={this.handleSubmitButtonOnCreatwWallet}
                            />
                        )}
                        {currentInputForm === InputForm.CreateAddress && (
                            <CreateAddressForm
                                onCancel={this.handleCancelButton}
                                onSubmit={this.handleSumitButtonOnCreateAddress}
                            />
                        )}
                        {currentInputForm === InputForm.DownloadWallet && (
                            <DownloadWalletForm
                                onConfirm={this.handleCancelButton}
                            />
                        )}
                    </div>
                </Modal>
            </div>
        );
    }

    private clearForm = () => {
        this.setState({ currentInputForm: InputForm.CreateWallet });
    };

    private handleCancelButton = () => {
        this.clearForm();
        this.props.onClose();
    };

    private handleSubmitButtonOnCreatwWallet = () => {
        this.setState({ currentInputForm: InputForm.CreateAddress });
    };

    private handleSumitButtonOnCreateAddress = () => {
        this.setState({ currentInputForm: InputForm.DownloadWallet });
    };
}
