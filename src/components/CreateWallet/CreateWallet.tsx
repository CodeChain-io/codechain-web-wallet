import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Container } from "reactstrap";

import * as _ from "lodash";
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
}

interface DispatchProps {
    login: (passpharase: string) => void;
    clearData: () => void;
}

type Props = RouteComponentProps & DispatchProps;
class CreateWallet extends React.Component<Props, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            currentPage: PageState.inputPassPhrase,
            passphrase: undefined
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
                            onSubmit={this.handleSumitShowPhrase}
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

    private handleSubmitPassphraseInput = async (passphrase: string) => {
        await createSeed(passphrase);
        const mnemonicString = await exportMnemonic(passphrase);
        const mnemonic = mnemonicString.split(" ");
        this.setState({
            currentPage: PageState.showSecretPhrase,
            passphrase,
            mnemonic
        });
    };

    private handleSumitShowPhrase = () => {
        this.setState({ currentPage: PageState.confirmSecretPhrase });
    };

    private handleConfirmPhrase = () => {
        const { login, history } = this.props;
        const { passphrase } = this.state;
        login(passphrase!);
        // FIXME: Currently, React-chrome-redux saves data to the background script asynchronously.
        // This code is temporary for solving this problem.
        setTimeout(() => {
            history.push(`/`);
        }, 300);
    };
}

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    login: (passphrase: string) => {
        dispatch(globalActions.login(passphrase));
    },
    clearData: () => {
        dispatch(globalActions.clearData());
    }
});

export default connect(
    () => ({}),
    mapDispatchToProps
)(withRouter(CreateWallet));
