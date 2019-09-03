import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Container } from "reactstrap";

import _ from "lodash";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
    clearKeystore,
    createSeed,
    exportMnemonic
} from "../../model/keystore";
import { ReducerConfigure } from "../../redux";
import globalActions from "../../redux/global/globalActions";
import actions from "../../redux/wallet/walletActions";
import { clearPassphrase, clearWalletKeys } from "../../utils/storage";
import ConfirmBackupPhrase from "./ConfirmBackupPhrase/ConfirmBackupPhrase";
import "./CreateWallet.css";
import InputPassphrase from "./InputPassphrase/InputPassphrase";
import ShowBackupPhrase from "./ShowBackupPhrase/ShowBackupPhrase";

enum PageState {
    inputPassPhrase = 1,
    showSecretPhrase,
    confirmSecretPhrase
}

interface State {
    currentPage: PageState;
    passphrase?: string | null;
    mnemonic?: string[];
    username?: string;
}

interface DispatchProps {
    login: (passpharase: string) => Promise<void>;
    clearData: () => Promise<void>;
    createWalletAssetAddress: () => Promise<void>;
    createWalletPlatformAddress: () => Promise<void>;
}

type Props = RouteComponentProps & DispatchProps;
class CreateWallet extends React.Component<Props, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            currentPage: PageState.inputPassPhrase,
            passphrase: undefined,
            username: undefined
        };
    }
    public async componentDidMount() {
        const { clearData } = this.props;
        clearPassphrase();
        clearData();
        clearWalletKeys();
        await clearKeystore();
    }
    public render() {
        const { currentPage, mnemonic } = this.state;
        return (
            <Container className="Create-wallet animated fadeIn">
                <div className="close-btn">
                    <Link to="/selectKeyfile">
                        <FontAwesomeIcon icon="times" className="icon" />
                    </Link>
                </div>
                <div className="create-wallet-form-group">
                    {currentPage === PageState.inputPassPhrase && (
                        <InputPassphrase
                            onSubmit={this.handleSubmitPassphraseInput}
                        />
                    )}
                    {currentPage === PageState.showSecretPhrase && (
                        <ShowBackupPhrase
                            onSubmit={this.handleSubmitShowPhrase}
                            mnemonic={mnemonic!}
                        />
                    )}
                    {currentPage === PageState.confirmSecretPhrase && (
                        <ConfirmBackupPhrase
                            phrases={mnemonic!}
                            onConfirm={this.handleConfirmPhrase}
                        />
                    )}
                </div>
                <div className="dot-indicator-container">
                    {_.map(_.range(3), index => {
                        return (
                            <FontAwesomeIcon
                                key={`dot-${index}`}
                                icon="circle"
                                className={`indicator-icon ${
                                    index < currentPage ? "active" : "inactive"
                                }`}
                            />
                        );
                    })}
                </div>
            </Container>
        );
    }

    private handleSubmitPassphraseInput = async (
        username: string,
        passphrase: string
    ) => {
        await createSeed(passphrase);
        const mnemonicString = await exportMnemonic(passphrase);
        const mnemonic = mnemonicString.split(" ");
        this.setState({
            currentPage: PageState.showSecretPhrase,
            passphrase,
            mnemonic,
            username
        });
    };

    private handleSubmitShowPhrase = () => {
        this.setState({ currentPage: PageState.confirmSecretPhrase });
    };

    private handleConfirmPhrase = async () => {
        const { login, history } = this.props;
        const { passphrase, username } = this.state;
        localStorage.setItem("USERNAME", username!);
        await login(passphrase!);
        await this.props.createWalletAssetAddress();
        await this.props.createWalletPlatformAddress();
        history.push(`/`);
    };
}

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: (passphrase: string) => {
        return dispatch(globalActions.login(passphrase));
    },
    clearData: () => {
        return dispatch(globalActions.clearData());
    },
    createWalletPlatformAddress: () => {
        return dispatch(actions.createWalletPlatformAddress());
    },
    createWalletAssetAddress: () => {
        return dispatch(actions.createWalletAssetAddress());
    }
});

export default connect(
    () => ({}),
    mapDispatchToProps
)(withRouter(CreateWallet));
