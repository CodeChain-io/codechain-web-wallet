import { U64 } from "codechain-sdk/lib/core/classes";
import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { match } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../redux";
import accountActions from "../../redux/account/accountActions";
import walletActions from "../../redux/wallet/walletActions";
import AddressContainer from "../AddressContainer/AddressContainer";
import PayTxHistory from "../PayTxHistory/PayTxHistory";
import "./Account.css";
import SendCCC from "./SendAsset/SendCCC";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    availableQuark?: U64 | null;
    addressIndex?: number | null;
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

interface State {
    sendingCCC: boolean;
}

type Props = WithTranslation & OwnProps & StateProps & DispatchProps;

class Account extends React.Component<Props, State> {
    private refresher: any;
    public constructor(props: Props) {
        super(props);
        this.state = {
            sendingCCC: false
        };
    }
    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            match: {
                params: { address: nextAddress }
            }
        } = props;
        if (nextAddress !== address) {
            this.init();
        }
    }

    public componentDidMount() {
        this.init();
    }

    public componentWillUnmount() {
        this.clearInterval();
    }

    public render() {
        const {
            availableQuark,
            match: {
                params: { address }
            },
            addressIndex
        } = this.props;
        const { sendingCCC } = this.state;
        if (!availableQuark) {
            return null;
        }
        return (
            <div className="Account animated fadeIn">
                <div className="d-flex">
                    <div className="left-panel mx-auto">
                        <AddressContainer
                            address={address}
                            backButtonPath="/"
                            addressIndex={addressIndex}
                        />
                        <div>
                            <div className="element-container mb-3">
                                <h4 className="element-title">
                                    <Trans i18nKey="send:ccc.balance" />
                                </h4>
                                <div className="ccc-text number">
                                    <span className="mr-2">
                                        {availableQuark.toLocaleString()}
                                    </span>
                                    <span>CCC</span>
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn btn-primary square reverse send-btn mr-3 mb-3"
                                        onClick={this.openSendingCCC}
                                        disabled={sendingCCC}
                                    >
                                        <Trans i18nKey="send:ccc.button" />
                                    </button>
                                </div>
                            </div>
                            <div className="element-container">
                                <h4 className="mb-3">
                                    <Trans i18nKey="send:ccc.recent.title" />
                                </h4>
                                <PayTxHistory address={address} />
                            </div>
                        </div>
                    </div>
                    {sendingCCC && (
                        <div className="right-container">
                            <div className="right-panel">
                                <SendCCC
                                    address={address}
                                    onClose={this.handleCloseSendingCCC}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private openSendingCCC = () => {
        window.scrollTo(0, 0);
        this.setState({ sendingCCC: true });
    };

    private handleCloseSendingCCC = () => {
        this.setState({
            sendingCCC: false
        });
    };

    private init = async () => {
        this.clearInterval();
        this.refresher = setInterval(() => {
            this.fetchAll();
        }, 10000);
        this.fetchAll();
    };
    private clearInterval = () => {
        if (this.refresher) {
            clearInterval(this.refresher);
        }
    };
    private fetchAll = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchAvailableQuark(address);
        this.props.fetchWalletFromStorageIfNeed();
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const availableQuark = state.accountReducer.availableQuark[address];
    const assetAddress = _.find(
        state.walletReducer.platformAddresses,
        aa => aa.address === address
    );
    return {
        availableQuark,
        addressIndex: assetAddress && assetAddress.index
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(Account));
