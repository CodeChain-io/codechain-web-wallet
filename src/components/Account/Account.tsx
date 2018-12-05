import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { PlatformAccount } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import { changeQuarkToCCCString } from "../../utils/unit";

import * as _ from "lodash";
import AddressContainer from "../AddressContainer/AddressContainer";
import "./Account.css";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    account?: PlatformAccount | null;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAccountIfNeed: (address: string) => void;
    fetchWalletFromStorageIfNeed: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class Account extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
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
            account,
            match: {
                params: { address }
            },
            addressName
        } = this.props;
        if (!account) {
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
                                        {changeQuarkToCCCString(
                                            account.balance
                                        )}
                                    </span>
                                    <span>CCC</span>
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-primary square reverse send-btn">
                                        SEND
                                    </button>
                                </div>
                            </div>
                            <div className="element-container">
                                <h5 className="element-title">
                                    Transaction history
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private init = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchAccountIfNeed(address);
        this.props.fetchWalletFromStorageIfNeed();
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const account = state.walletReducer.accounts[address];
    const assetAddress = _.find(
        state.walletReducer.platformAddresses,
        aa => aa.address === address
    );
    return {
        account: account && account.data,
        addressName: assetAddress && assetAddress.name
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAccountIfNeed: (address: string) => {
        dispatch(actions.fetchAccountIfNeed(address));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(actions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Account);
