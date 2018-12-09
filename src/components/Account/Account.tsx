import { U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../redux";
import accountActions from "../../redux/account/accountActions";
import walletActions from "../../redux/wallet/walletActions";
import { changeQuarkToCCCString } from "../../utils/unit";
import AddressContainer from "../AddressContainer/AddressContainer";
import ParcelHistory from "../ParcelHistory/ParcelHistory";
import "./Account.css";
import SendCCC from "./SendAsset/SendCCC";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    availableQuark?: U256 | null;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

interface State {
    sendingCCC: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class Account extends React.Component<Props, State> {
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
    public render() {
        const {
            availableQuark,
            match: {
                params: { address }
            },
            addressName
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
                            addressName={addressName}
                        />
                        <div>
                            <div className="element-container mb-3">
                                <h5 className="element-title">Balance</h5>
                                <div className="ccc-text number">
                                    <span className="mr-2">
                                        {changeQuarkToCCCString(availableQuark)}
                                    </span>
                                    <span>CCC</span>
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn btn-primary square reverse send-btn"
                                        onClick={this.openSendingCCC}
                                        disabled={sendingCCC}
                                    >
                                        SEND
                                    </button>
                                </div>
                            </div>
                            <div className="element-container">
                                <h4 className="mb-3">Transaction history</h4>
                                <ParcelHistory address={address} />
                            </div>
                        </div>
                    </div>
                    {sendingCCC && (
                        <div className="send-ccc-container">
                            <div className="send-ccc-panel">
                                <SendCCC
                                    address={address}
                                    isSendingCCC={sendingCCC}
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
        this.setState({ sendingCCC: true });
    };

    private handleCloseSendingCCC = () => {
        this.setState({
            sendingCCC: false
        });
    };

    private init = async () => {
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
