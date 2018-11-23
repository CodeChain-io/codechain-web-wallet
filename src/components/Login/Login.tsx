import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { Dispatch } from "redux";
import { loadWallet } from "../../model/wallet";
import actions from "../../redux/global/globalActions";
import CreateWalletForm from "../CreateWalletForm/CreateWalletForm";
import "./Login.css";

import CreateAddressForm from "../CreateAddressForm/CreateAddressForm";
import * as CreateNewWalletIconHover from "./img/icons-createnewwallet-hover.svg";
import * as CreateNewWalletIcon from "./img/icons-createnewwallet-standard.svg";
import * as ImportKeyIconHover from "./img/icons-importkeyfile-hover.svg";
import * as ImportKeyIcon from "./img/icons-importkeyfile-standard.svg";
import * as Logo from "./img/logo-vertical.svg";

interface DispatchProps {
    login: () => void;
}

interface State {
    redirectToReferrer: boolean;
    pageState: PageState;
    walletName?: string;

    isImportBtnHover: boolean;
    isCreateBtnHover: boolean;
}

enum PageState {
    Login,
    CreateWallet,
    CreateAddress
}

type Props = DispatchProps;
class Login extends React.Component<Props, State> {
    private fileSelector: React.RefObject<HTMLInputElement>;
    private fileReader: FileReader;
    public constructor(props: Props) {
        super(props);
        this.state = {
            redirectToReferrer: false,
            pageState: PageState.CreateWallet,
            walletName: undefined,
            isCreateBtnHover: false,
            isImportBtnHover: false
        };
        this.fileSelector = React.createRef<HTMLInputElement>();
    }
    public render() {
        const {
            redirectToReferrer,
            pageState,
            isImportBtnHover,
            isCreateBtnHover
        } = this.state;
        if (redirectToReferrer) {
            return <Redirect to="/" />;
        }
        return (
            <Container className="Login">
                <div className="login-container">
                    {pageState === PageState.Login && (
                        <div>
                            <div className="text-center">
                                <img src={Logo} className="logo" />
                                <h1 className="mt-4 logo-title">Wallet</h1>
                            </div>
                            <div className="button-container d-flex">
                                <div
                                    className="button-item"
                                    onClick={this.onClickCreateWallet}
                                    onMouseEnter={this.handleCreateButtonHover}
                                    onMouseLeave={this.handleCreateButtonOut}
                                >
                                    <div>
                                        {isCreateBtnHover ? (
                                            <img
                                                src={CreateNewWalletIconHover}
                                                className="icon"
                                            />
                                        ) : (
                                            <img
                                                src={CreateNewWalletIcon}
                                                className="icon"
                                            />
                                        )}
                                    </div>
                                    <div className="text">
                                        CREATE
                                        <br />
                                        NEW WALLET
                                    </div>
                                    <input
                                        type="file"
                                        className="file-selector"
                                        ref={this.fileSelector}
                                        onChange={this.handleFileSelect}
                                    />
                                </div>
                                <div
                                    className="button-item"
                                    onClick={this.onClickLogin}
                                    onMouseEnter={this.handleImportButtonHover}
                                    onMouseLeave={this.handleImportButtopOut}
                                >
                                    <div>
                                        {isImportBtnHover ? (
                                            <img
                                                src={ImportKeyIconHover}
                                                className="icon"
                                            />
                                        ) : (
                                            <img
                                                src={ImportKeyIcon}
                                                className="icon"
                                            />
                                        )}
                                    </div>
                                    <div className="text">
                                        IMPORT
                                        <br />
                                        KEY FILE
                                    </div>
                                    <input
                                        type="file"
                                        className="file-selector"
                                        ref={this.fileSelector}
                                        onChange={this.handleFileSelect}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {pageState === PageState.CreateWallet && (
                        <div className="login-create-wallet-container">
                            <div className="d-flex panel-container">
                                <div className="create-left-panel">
                                    <CreateWalletForm
                                        onSubmit={
                                            this.handleSubmitOnCreateWallet
                                        }
                                        onCancel={
                                            this.handleCancelOnCreateWallet
                                        }
                                    />
                                </div>
                                <div className="create-right-panel">
                                    <CreateAddressForm
                                        onCancel={
                                            this.handleCancelOnCreateAddress
                                        }
                                        onSubmit={
                                            this.handleSubmitOnCreateAddress
                                        }
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between login-button-container">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={true}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        );
    }
    private handleImportButtonHover = () => {
        this.setState({ isImportBtnHover: true });
    };
    private handleImportButtopOut = () => {
        this.setState({ isImportBtnHover: false });
    };
    private handleCreateButtonHover = () => {
        this.setState({ isCreateBtnHover: true });
    };
    private handleCreateButtonOut = () => {
        this.setState({ isCreateBtnHover: false });
    };
    private onClickLogin = () => {
        this.fileSelector.current!.click();
    };
    private handleFileReader = async () => {
        const content = this.fileReader.result as string;
        try {
            await loadWallet(content);
            this.props.login();
            this.setState({ redirectToReferrer: true });
        } catch (e) {
            console.log(e);
            alert("Invalid file");
        }
    };
    private handleFileSelect = (event: any) => {
        if (event.target.files === 0) {
            return;
        }
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileReader;
        this.fileReader.readAsText(event.target.files[0]);
    };
    private onClickCreateWallet = () => {
        this.setState({
            pageState: PageState.CreateWallet
        });
    };
    private handleCancelOnCreateWallet = () => {
        this.setState({
            pageState: PageState.Login,
            walletName: undefined
        });
    };
    private handleSubmitOnCreateWallet = (walletName: string) => {
        this.setState({
            pageState: PageState.CreateAddress,
            walletName
        });
    };
    private handleSubmitOnCreateAddress = () => {
        this.props.login();
        this.setState({ redirectToReferrer: true });
    };
    private handleCancelOnCreateAddress = () => {
        this.setState({
            pageState: PageState.Login,
            walletName: undefined
        });
    };
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
    login: () => {
        dispatch(actions.login());
    }
});
export default connect(
    () => ({}),
    mapDispatchToProps
)(Login);
