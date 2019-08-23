import * as React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../model/address";
import { clearKeystore } from "../../model/keystore";
import { ReducerConfigure } from "../../redux";
import globalActions from "../../redux/global/globalActions";
import { clearPassphrase, clearWalletKeys } from "../../utils/storage";
import * as Logo from "./img/logo-vertical.svg";
import * as CreateNewWalletIconHover from "./img/plus-hover.svg";
import * as CreateNewWalletIcon from "./img/plus-standard.svg";
import * as ImportKeyIconHover from "./img/restore-hover.svg";
import * as ImportKeyIcon from "./img/restore-standard.svg";
import "./SelectKeyFile.css";

interface StateProps {
    creatingAddresses?: WalletAddress[] | null;
    walletName?: string | null;
}

interface DispatchProps {
    clearData: () => void;
}

interface State {
    isImportBtnHover: boolean;
    isCreateBtnHover: boolean;
}

type Props = WithTranslation & RouteComponentProps & DispatchProps & StateProps;
class SelectKeyFile extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCreateBtnHover: false,
            isImportBtnHover: false
        };
    }
    public async componentDidMount() {
        await clearKeystore();
        clearWalletKeys();
        clearPassphrase();
        this.props.clearData();
    }
    public render() {
        const { isImportBtnHover, isCreateBtnHover } = this.state;
        return (
            <Container className="Select-key-file animated fadeIn">
                <div className="text-center title-container">
                    <img src={Logo} className="logo" />
                    <h1 className="mt-4 logo-title">Wallet</h1>
                </div>
                <div className="welcome-text-container">
                    <h4 className="welcome-text">
                        Welcome to CodeChain wallet
                    </h4>
                    <div>
                        <span className="description-text">
                            <Trans i18nKey="create:select.title" />
                        </span>
                    </div>
                </div>
                <div className="button-container d-flex justify-content-center">
                    <div
                        className="button-item d-flex align-items-center justify-content-center"
                        onClick={this.onClickCreateWallet}
                        onMouseEnter={this.handleCreateButtonHover}
                        onMouseLeave={this.handleCreateButtonOut}
                    >
                        <div>
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
                                <Trans i18nKey="create:select.create.title" />
                            </div>
                            <div className="button-description">
                                <span>
                                    <Trans i18nKey="create:select.create.detail" />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="button-item d-flex justify-content-center"
                        onClick={this.onClickRestore}
                        onMouseEnter={this.handleImportButtonHover}
                        onMouseLeave={this.handleImportButtopOut}
                    >
                        <div>
                            <div>
                                {isImportBtnHover ? (
                                    <img
                                        src={ImportKeyIconHover}
                                        className="icon"
                                    />
                                ) : (
                                    <img src={ImportKeyIcon} className="icon" />
                                )}
                            </div>
                            <div className="text">
                                <Trans i18nKey="create:select.restore.title" />
                            </div>
                            <div className="button-description">
                                <span>
                                    <Trans i18nKey="create:select.restore.detail" />
                                </span>
                            </div>
                        </div>
                    </div>
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
    private onClickRestore = () => {
        const { history } = this.props;
        history.push(`/restoreWallet`);
    };
    private onClickCreateWallet = () => {
        const { history } = this.props;
        history.push(`/createWallet`);
    };
}
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    clearData: () => {
        dispatch(globalActions.clearData());
    }
});

export default connect(
    () => ({}),
    mapDispatchToProps
)(withTranslation("select")(withRouter(SelectKeyFile)));
