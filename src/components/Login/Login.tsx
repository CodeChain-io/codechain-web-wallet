import * as React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { Action } from "redux";
import actions from "../../redux/global/globalActions";
import "./Login.css";

import { Link } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { AddressType, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import walletActions from "../../redux/wallet/walletActions";
import * as Logo from "./img/logo-vertical.svg";
import LoginForm from "./LoginForm/LoginForm";
interface StateProps {
    creatingAddresses?: WalletAddress[] | null;
    walletName?: string | null;
}

interface DispatchProps {
    login: () => void;
    clearData: () => void;
}

interface State {
    passphrase: string;
}

type Props = DispatchProps & StateProps;
class Login extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            passphrase: ""
        };
    }
    public componentDidMount() {
        this.props.clearData();
    }
    public render() {
        const { passphrase } = this.state;
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

    public handleSignIn = () => {
        // TODO
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
