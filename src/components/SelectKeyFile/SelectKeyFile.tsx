import * as React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { Action } from "redux";
import actions from "../../redux/global/globalActions";
import "./SelectKeyFile.css";

import { RouteComponentProps, withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import { AddressType, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import walletActions from "../../redux/wallet/walletActions";
import * as Logo from "./img/logo-vertical.svg";
import * as CreateNewWalletIconHover from "./img/plus-hover.svg";
import * as CreateNewWalletIcon from "./img/plus-standard.svg";
import * as ImportKeyIconHover from "./img/restore-hover.svg";
import * as ImportKeyIcon from "./img/restore-standard.svg";

interface StateProps {
    creatingAddresses?: WalletAddress[] | null;
    walletName?: string | null;
}

interface DispatchProps {
    login: () => void;
    clearData: () => void;
}

interface State {
    isImportBtnHover: boolean;
    isCreateBtnHover: boolean;
}

type Props = RouteComponentProps & DispatchProps & StateProps;
class SelectKeyFile extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCreateBtnHover: false,
            isImportBtnHover: false
        };
    }
    public componentDidMount() {
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
                                Create
                                <br />
                                new wallet
                            </div>
                        </div>
                    </div>
                    <div
                        className="button-item d-flex align-items-center justify-content-center"
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
                                Restore
                                <br />
                                your wallet
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
)(withRouter(SelectKeyFile));
