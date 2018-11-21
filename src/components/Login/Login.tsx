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

interface DispatchProps {
    login: () => void;
}

interface State {
    redirectToReferrer: boolean;
    pageState: PageState;
    walletName?: string;
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
            walletName: undefined
        };
        this.fileSelector = React.createRef<HTMLInputElement>();
    }
    public render() {
        const { redirectToReferrer, pageState, walletName } = this.state;
        if (redirectToReferrer) {
            return <Redirect to="/" />;
        }
        return (
            <Container className="Login">
                <div className="login-container">
                    {pageState === PageState.Login && (
                        <div className="button-container">
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-primary mb-3"
                                    onClick={this.onClickLogin}
                                >
                                    SELECT WALLET FILE
                                </button>
                                <input
                                    type="file"
                                    className="file-selector"
                                    ref={this.fileSelector}
                                    onChange={this.handleFileSelect}
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={this.onClickCreateWallet}
                                >
                                    CREATE NEW WALLET
                                </button>
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
