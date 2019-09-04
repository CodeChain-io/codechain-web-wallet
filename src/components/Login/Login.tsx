import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { Action } from "redux";
import actions from "../../redux/global/globalActions";
import "./Login.css";

import {
    Link,
    Redirect,
    RouteComponentProps,
    withRouter
} from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { checkPassphrase } from "../../model/keystore";
import { ReducerConfigure } from "../../redux";
import { getNetworkId, getPassphrase } from "../../utils/storage";
import Logo from "./img/logo-vertical.svg";
import LoginForm from "./LoginForm/LoginForm";

interface DispatchProps {
    login: (passphrase: string) => Promise<void>;
    clearData: () => Promise<void>;
    updateNetworkId: (networkId: NetworkId) => Promise<void>;
}

interface OwnProps {
    location: {
        state: {
            from: string;
        };
    };
}

interface State {
    passphrase: string;
    isValid?: boolean;
    redirectToReferrer: boolean;
    username?: string | null;
}

type Props = WithTranslation & RouteComponentProps & DispatchProps & OwnProps;
class Login extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            passphrase: "",
            isValid: undefined,
            redirectToReferrer: false,
            username: undefined
        };
    }
    public componentDidMount() {
        const { login, updateNetworkId } = this.props;
        this.props.clearData();

        const savedNetworkId = getNetworkId();
        if (savedNetworkId) {
            updateNetworkId(savedNetworkId);
        }

        const savedPassphrase = getPassphrase();
        if (savedPassphrase) {
            login(savedPassphrase);
            this.setState({ redirectToReferrer: true });
        }

        const username = localStorage.getItem("USERNAME");
        this.setState({ username });
    }
    public render() {
        const {
            passphrase,
            isValid,
            redirectToReferrer,
            username
        } = this.state;
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        return (
            <Container className="Login animated fadeIn">
                <div className="title-container text-center">
                    <img src={Logo} alt={"logo"} className="logo" />
                    <h1 className="mt-4 logo-title">Wallet</h1>
                </div>
                <div className="login-form-container">
                    <div className="d-flex justify-content-center">
                        <LoginForm
                            onChange={this.handleOnChangePassphrase}
                            passphrase={passphrase}
                            onSignIn={this.handleSignIn}
                            isValid={isValid}
                            username={username}
                        />
                    </div>
                </div>
                <div className="text-center open-different-btn-container">
                    <Link className="open-different-btn" to="/selectKeyfile">
                        <Trans i18nKey="welcome:different" />
                    </Link>
                </div>
            </Container>
        );
    }

    public handleOnChangePassphrase = (passphrase: string) => {
        this.setState({ passphrase, isValid: undefined });
    };

    public handleSignIn = async () => {
        const { login, history } = this.props;
        const { passphrase } = this.state;

        const isValid = await checkPassphrase(passphrase);
        if (!isValid) {
            this.setState({ isValid: false, passphrase: "" });
            return;
        }

        await login(passphrase);
        history.push(`/`);
    };
}

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: (passphrase: string) => {
        return dispatch(actions.login(passphrase));
    },
    clearData: () => {
        return dispatch(actions.clearData());
    },
    updateNetworkId: (netowrkId: NetworkId) => {
        return dispatch(actions.updateNetworkId(netowrkId));
    }
});

export default connect(
    () => ({}),
    mapDispatchToProps
)(withTranslation()(withRouter(Login)));
