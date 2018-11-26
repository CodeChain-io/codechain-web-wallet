import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
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
import * as copyBtn from "./img/icons-copy.svg";
import * as copyBtnHover from "./img/icons-copyselect.svg";
import * as mainnet from "./img/mainnet.svg";
import * as testnet from "./img/testnet.svg";

interface OwnProps {
    walletAddress: WalletAddress;
    className?: string | null;
    account?: PlatformAccount | null;
}
interface DispatchProps {
    fetchAccountIfNeed: (address: string) => void;
}
interface State {
    isCopyHovering: boolean;
}

type Props = RouteComponentProps & OwnProps & DispatchProps;

class AddressItem extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCopyHovering: false
        };
    }
    public componentDidMount() {
        const { walletAddress, fetchAccountIfNeed } = this.props;
        fetchAccountIfNeed(walletAddress.address);
    }
    public render() {
        const { walletAddress, className, account } = this.props;
        const { isCopyHovering } = this.state;
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
                        <div className="ml-auto mb-0 d-flex align-items-center">
                            <span className="network-text">
                                {getNetworkNameById(walletAddress.networkId)}
                            </span>
                            <img
                                className="ml-2"
                                src={`${
                                    walletAddress.networkId === "cc"
                                        ? mainnet
                                        : testnet
                                }`}
                            />
                        </div>
                    </div>
                    <div>
                        <p className="address-name mb-0 mono">
                            {walletAddress.name}
                        </p>
                    </div>
                    <span className="address-text mono">
                        {walletAddress.address.slice(0, 12)}
                        ...
                        {walletAddress.address.slice(
                            walletAddress.address.length - 12,
                            walletAddress.address.length
                        )}
                    </span>
                    <CopyToClipboard
                        text={walletAddress.address}
                        onCopy={this.handleCopyAddress}
                    >
                        <img
                            className="ml-2"
                            src={isCopyHovering ? copyBtnHover : copyBtn}
                            onMouseOver={this.hoverCopyBtn}
                            onMouseOut={this.outCopyBtn}
                        />
                    </CopyToClipboard>
                </div>
                {walletAddress.type === AddressType.Platform && (
                    <div className="platform-account">
                        {account ? (
                            <span className="mono balance">
                                {changeQuarkToCCCString(account.balance)} CCC
                            </span>
                        ) : (
                            <span className="mono balance">Loading...</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
    private handleClick = () => {
        const { walletAddress, history } = this.props;
        const { isCopyHovering } = this.state;
        if (isCopyHovering) {
            return;
        }
        if (walletAddress.type === AddressType.Platform) {
            history.push(`/${walletAddress.address}/account`);
        } else {
            history.push(`/${walletAddress.address}/assets`);
        }
    };
    private hoverCopyBtn = () => {
        this.setState({ isCopyHovering: true });
    };
    private outCopyBtn = () => {
        this.setState({ isCopyHovering: false });
    };
    private handleCopyAddress = () => {
        toast.info("Copied!", {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 3000
        });
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
