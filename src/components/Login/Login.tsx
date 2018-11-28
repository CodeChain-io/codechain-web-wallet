import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { Action } from "redux";
import { importKeystore } from "../../model/keystore";
import actions from "../../redux/global/globalActions";
import CreateWalletForm from "../CreateWalletForm/CreateWalletForm";
import "./Login.css";

import { ThunkDispatch } from "redux-thunk";
import { AddressType, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import walletActions from "../../redux/wallet/walletActions";
import CreateAddressForm from "../CreateAddressForm/CreateAddressForm";
import * as CreateNewWalletIconHover from "./img/icons-createnewwallet-hover.svg";
import * as CreateNewWalletIcon from "./img/icons-createnewwallet-standard.svg";
import * as ImportKeyIconHover from "./img/icons-importkeyfile-hover.svg";
import * as ImportKeyIcon from "./img/icons-importkeyfile-standard.svg";
import * as Logo from "./img/logo-vertical.svg";

interface StateProps {
    creatingAddresses?: WalletAddress[] | null;
    walletName?: string | null;
}

interface DispatchProps {
    login: () => void;
    createWalletAddress: (
        addressType: AddressType,
        name: string,
        passphrase: string
    ) => void;
    clearData: () => void;
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
    CreateWallet
}

type Props = DispatchProps & StateProps;
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
    public componentDidMount() {
        this.props.clearData();
    }
    public render() {
        const {
            redirectToReferrer,
            pageState,
            isImportBtnHover,
            isCreateBtnHover
        } = this.state;
        const { creatingAddresses, walletName } = this.props;
        if (redirectToReferrer) {
            return <Redirect to="/" />;
        }
        return (
            <Container className="Login">
                <div className="login-container">
                    {pageState === PageState.Login && (
                        <div className="animated fadeIn">
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
                        <div className="login-create-wallet-container animated fadeIn">
                            <div className="d-flex panel-container">
                                <div className="create-left-panel">
                                    <CreateWalletForm />
                                </div>
                                <div className="create-right-panel">
                                    <CreateAddressForm
                                        onSubmit={this.handleSubmitOnAddAddress}
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between login-button-container">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={this.handleBackButton}
                                >
                                    BACK
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={
                                        walletName &&
                                        walletName.length > 0 &&
                                        creatingAddresses &&
                                        creatingAddresses.length > 0
                                            ? false
                                            : true
                                    }
                                    onClick={this.handleLogin}
                                >
                                    GO TO WALLET
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        );
    }
    private handleBackButton = () => {
        this.setState({ pageState: PageState.Login });
    };
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
    private handleLogin = () => {
        this.props.login();
        this.setState({ redirectToReferrer: true });
    };
    private handleFileReader = async () => {
        const content = this.fileReader.result as string;
        try {
            await importKeystore(content);
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
    private handleSubmitOnAddAddress = (
        type: AddressType,
        name: string,
        passphrase: string
    ) => {
        this.props.createWalletAddress(type, name, passphrase);
    };
}

const mapStateToProps = (state: ReducerConfigure) => {
    const creatingAddresses = state.walletReducer.creatingAddresses;
    const walletName = state.walletReducer.walletName;
    return {
        creatingAddresses,
        walletName
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: () => {
        dispatch(actions.login());
    },
    createWalletAddress: (
        addressType: AddressType,
        name: string,
        passphrase: string
    ) => {
        if (addressType === AddressType.Asset) {
            dispatch(walletActions.createWalletAssetAddress(name, passphrase));
        } else {
            dispatch(
                walletActions.createWalletPlatformAddress(name, passphrase)
            );
        }
    },
    clearData: () => {
        dispatch(actions.clearData());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
