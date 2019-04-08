import { U64 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
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
import Exchange from "./Exchange";
import SendCCC from "./SendAsset/SendCCC";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    availableQuark?: U64 | null;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

interface State {
    sendingCCC: boolean;
    exchanging: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class Account extends React.Component<Props, State> {
    private refresher: any;
    public constructor(props: Props) {
        super(props);
        this.state = {
            sendingCCC: false,
            exchanging: false
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
            addressName
        } = this.props;
        const { sendingCCC, exchanging } = this.state;
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
                            addressName={addressName}
                        />
                        <div>
                            <div className="element-container mb-3">
                                <h5 className="element-title">Balance</h5>
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
                                        SEND
                                    </button>
                                    <button
                                        className="btn btn-primary square send-btn mb-3"
                                        onClick={this.openExchanging}
                                        disabled={exchanging}
                                    >
                                        BUY
                                    </button>
                                </div>
                            </div>
                            <div className="element-container">
                                <h4 className="mb-3">Recent transactions</h4>
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
                    {exchanging && (
                        <div className="right-container">
                            <div className="right-panel">
                                <Exchange
                                    onClose={this.handleCloseExchanging}
                                    address={address}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private openSendingCCC = () => {
        this.setState({ sendingCCC: true, exchanging: false });
    };

    private openExchanging = () => {
        this.setState({ exchanging: true, sendingCCC: false });
    };

    private handleCloseExchanging = () => {
        this.setState({
            exchanging: false
        });
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
        }, 5000);
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
        addressName: assetAddress && assetAddress.name
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
)(Account);
