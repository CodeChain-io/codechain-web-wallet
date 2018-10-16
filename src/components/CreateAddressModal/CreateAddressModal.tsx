import * as _ from "lodash";
import * as React from "react";
import * as Modal from "react-modal";
import CreateAddressContainer from "./CreateAddressContainer/CreateAddressContainer";
import "./CreateAddressModal.css";
import CreateWalletForm from "./CreateWalletForm/CreateWalletForm";

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
    CreateAddress
}

interface Props {
    onClose: () => void;
    isOpen: boolean;
}

interface State {
    walletName: string;
    currentInputForm: InputForm;
}

export default class CreateAddressModal extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            currentInputForm: InputForm.CreateWallet,
            walletName: ""
        };
    }

    public render() {
        const { isOpen, onClose } = this.props;
        const { currentInputForm, walletName } = this.state;
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
                            <CreateAddressContainer
                                onCancel={this.handleCancelButton}
                                onSubmit={this.handleCancelButton}
                                walletName={walletName}
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

    private handleCancelButton = async () => {
        this.clearForm();
        this.props.onClose();
    };

    private handleSubmitButtonOnCreatwWallet = (walletName: string) => {
        this.setState({
            currentInputForm: InputForm.CreateAddress,
            walletName
        });
    };
}
