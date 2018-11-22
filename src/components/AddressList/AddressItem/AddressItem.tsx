import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
    AddressType,
    PlatformAccount,
    WalletAddress
} from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import walletActions from "../../../redux/wallet/walletActions";
import { getNetworkNameById } from "../../../utils/network";
import { changeQuarkToCCCString } from "../../../utils/unit";
import "./AddressItem.css";

interface OwnProps {
    walletAddress: WalletAddress;
    className?: string | null;
    account?: PlatformAccount | null;
}
interface DispatchProps {
    fetchAccountIfNeed: (address: string) => void;
}

type Props = RouteComponentProps & OwnProps & DispatchProps;

class AddressItem extends React.Component<Props> {
    public componentDidMount() {
        const { walletAddress, fetchAccountIfNeed } = this.props;
        fetchAccountIfNeed(walletAddress.address);
    }
    public render() {
        const { walletAddress, className, account } = this.props;
        return (
            <div
                className={`Address-item mb-3 ${className}`}
                onClick={this.handleClick}
            >
                <div
                    className={`item-body ${
                        walletAddress.type === AddressType.Platform
                            ? "platform-type"
                            : "asset-type"
                    }`}
                >
                    <div className="d-flex network-text-container">
                        <span className="network-text ml-auto">
                            {getNetworkNameById(walletAddress.networkId)}
                        </span>
                    </div>
                    <div>
                        <p className="address-name mb-0 mono">
                            {walletAddress.name}
                        </p>
                    </div>
                    <span className="address-text mono">
                        {walletAddress.address.slice(0, 15)}
                        ...
                        {walletAddress.address.slice(
                            walletAddress.address.length - 15,
                            walletAddress.address.length
                        )}
                    </span>
                </div>
                {walletAddress.type === AddressType.Platform && (
                    <div className="platform-account">
                        {account && (
                            <span className="mono balance">
                                {changeQuarkToCCCString(account.balance)} CCC
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }
    private handleClick = () => {
        const { walletAddress, history } = this.props;
        if (walletAddress.type === AddressType.Platform) {
            history.push(`/${walletAddress.address}/account`);
        } else {
            history.push(`/${walletAddress.address}/assets`);
        }
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { walletAddress } = props;
    const account = state.walletReducer.accounts[walletAddress.address];
    return {
        account: account && account.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAccountIfNeed: (address: string) => {
        dispatch(walletActions.fetchAccountIfNeed(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(AddressItem));
