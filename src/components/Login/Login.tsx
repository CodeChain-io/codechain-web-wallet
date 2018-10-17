import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { loadWallet } from "../../model/wallet";
import CreateAddressModal from "../CreateAddressModal/CreateAddressModal";
import "./Login.css";

interface DispatchProps {
    login: () => void;
}

interface OwnProps {
    location: {
        state: any;
    };
}

interface State {
    redirectToReferrer: boolean;
    isCreateAddressModalOpen: boolean;
}

type Props = DispatchProps & OwnProps;
class Login extends React.Component<Props, State> {
    private fileSelector: React.RefObject<HTMLInputElement>;
    private fileReader: FileReader;
    public constructor(props: Props) {
        super(props);
        this.state = {
            redirectToReferrer: false,
            isCreateAddressModalOpen: false
        };
        this.fileSelector = React.createRef<HTMLInputElement>();
    }
    public render() {
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        const { redirectToReferrer, isCreateAddressModalOpen } = this.state;
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        return (
            <Container className="Login">
                <CreateAddressModal
                    onClose={this.handleOnCloseCreateAddressModal}
                    isOpen={isCreateAddressModalOpen}
                />
                <div className="login-container">
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
        this.setState({ isCreateAddressModalOpen: true });
    };
    private handleOnCloseCreateAddressModal = (redirect: boolean) => {
        this.setState({
            isCreateAddressModalOpen: false,
            redirectToReferrer: redirect
        });
    };
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
    login: () => {
        dispatch(Actions.login());
    }
});
export default connect(
    () => ({}),
    mapDispatchToProps
)(Login);
