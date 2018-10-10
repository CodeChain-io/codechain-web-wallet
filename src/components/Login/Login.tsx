import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
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
    public constructor(props: Props) {
        super(props);
        this.state = {
            redirectToReferrer: false,
            isCreateAddressModalOpen: false
        };
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
        this.props.login();
        this.setState({ redirectToReferrer: true });
    };
    private onClickCreateWallet = () => {
        this.setState({ isCreateAddressModalOpen: true });
    };
    private handleOnCloseCreateAddressModal = () => {
        this.setState({ isCreateAddressModalOpen: false });
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
