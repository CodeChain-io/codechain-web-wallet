import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { Dispatch } from "redux";
import { loadWallet } from "../../model/wallet";
import actions from "../../redux/global/globalActions";
import CreateAddressContainer from "../CreateAddressContainer/CreateAddressContainer";
import CreateWalletForm from "../CreateWalletForm/CreateWalletForm";
import "./Login.css";

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
            pageState: PageState.Login,
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
            walletName,
            isImportBtnHover,
            isCreateBtnHover
        } = this.state;
        if (redirectToReferrer) {
            return <Redirect to="/" />;
        }
        return (
            <Container className="Login">
                <div className="login-container">
                    <div className="text-center">
                        <img src={Logo} className="logo" />
                        <h1 className="mt-4 logo-title">Wallet</h1>
                    </div>
                    {pageState === PageState.Login && (
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
                    )}
                    {pageState === PageState.CreateWallet && (
                        <div>
                            <CreateWalletForm
                                onSubmit={this.handleSubmitOnCreateWallet}
                                onCancel={this.handleCancelOnCreateWallet}
                            />
                        </div>
                    )}
                    {pageState === PageState.CreateAddress && (
                        <div>
                            <CreateAddressContainer
                                onCancel={this.handleCancelOnCreateAddress}
                                onSubmit={this.handleSubmitOnCreateAddress}
                                walletName={walletName!}
                            />
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
