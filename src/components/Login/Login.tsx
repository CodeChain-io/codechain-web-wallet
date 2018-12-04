import * as React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { Action } from "redux";
import actions from "../../redux/global/globalActions";
import "./Login.css";

import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { checkPassphrase } from "../../model/keystore";
import { ReducerConfigure } from "../../redux";
import { clearPassphrase } from "../../utils/storage";
import * as Logo from "./img/logo-vertical.svg";
import LoginForm from "./LoginForm/LoginForm";

interface DispatchProps {
    login: (passphrase: string) => void;
    clearData: () => void;
}

interface State {
    passphrase: string;
    isValid?: boolean;
}

type Props = RouteComponentProps & DispatchProps;
class Login extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            passphrase: "",
            isValid: undefined
        };
    }
    public componentDidMount() {
        clearPassphrase();
        this.props.clearData();
    }
    public render() {
        const { passphrase, isValid } = this.state;
        return (
            <Container className="Login animated fadeIn">
                <div className="title-container text-center">
                    <img src={Logo} className="logo" />
                    <h1 className="mt-4 logo-title">Wallet</h1>
                </div>
                <div className="login-form-container">
                    <div className="d-flex justify-content-center">
                        <LoginForm
                            onChange={this.handleOnChangePassphrase}
                            passphrase={passphrase}
                            onSignIn={this.handleSignIn}
                            isValid={isValid}
                        />
                    </div>
                </div>
                <div className="text-center open-different-btn-container">
                    <Link className="open-different-btn" to="/selectKeyfile">
                        OPEN A DIFFERENT WALLET
                    </Link>
                </div>
            </Container>
        );
    }

    public handleOnChangePassphrase = (passphrase: string) => {
        this.setState({ passphrase });
    };

    public handleSignIn = async () => {
        const { history, login } = this.props;
        const { passphrase } = this.state;

        const isValid = await checkPassphrase(passphrase);
        if (!isValid) {
            this.setState({ isValid: false });
            return;
        }

        // TODO
        login(passphrase);
        history.push(`/`);
    };
}

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: (passphrase: string) => {
        dispatch(actions.login(passphrase));
    },
    clearData: () => {
        dispatch(actions.clearData());
    }
});

export default connect(
    () => ({}),
    mapDispatchToProps
)(withRouter(Login));
