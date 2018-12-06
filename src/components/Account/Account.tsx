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

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    availableCCC?: U256 | null;
    addressName?: string | null;
}

interface DispatchProps {
    fetchAvailableCCC: (address: string) => void;
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
            availableCCC,
            match: {
                params: { address }
            },
            addressName
        } = this.props;
        if (!availableCCC) {
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
                                        {changeQuarkToCCCString(availableCCC)}
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
                                <h4 className="mb-3">Transaction history</h4>
                                <ParcelHistory address={address} />
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
        this.props.fetchAvailableCCC(address);
        this.props.fetchWalletFromStorageIfNeed();
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const availableCCC = state.accountReducer.availableCCC[address];
    const assetAddress = _.find(
        state.walletReducer.platformAddresses,
        aa => aa.address === address
    );
    return {
        availableCCC,
        addressName: assetAddress && assetAddress.name
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableCCC: (address: string) => {
        dispatch(accountActions.fetchAvailableCCC(address));
    },
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Account);
