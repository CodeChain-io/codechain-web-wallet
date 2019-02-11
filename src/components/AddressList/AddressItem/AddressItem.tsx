import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { AddressType, WalletAddress } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import { changeQuarkToCCCString } from "../../../utils/unit";
import "./AddressItem.css";

import { U64 } from "codechain-sdk/lib/core/classes";
import accountActions from "../../../redux/account/accountActions";
import * as copyBtnHover from "./img/copy-hover.svg";
import * as copyBtn from "./img/copy.svg";

interface OwnProps {
    walletAddress: WalletAddress;
    className?: string | null;
}
interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
}
interface StateProps {
    availableQuark?: U64 | null;
}
interface State {
    isCopyHovering: boolean;
}

type Props = RouteComponentProps & OwnProps & DispatchProps & StateProps;

class AddressItem extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCopyHovering: false
        };
    }
    public componentDidMount() {
        const { walletAddress, fetchAvailableQuark } = this.props;
        if (walletAddress.type === AddressType.Platform) {
            fetchAvailableQuark(walletAddress.address);
        }
    }
    public render() {
        const { walletAddress, className, availableQuark } = this.props;
        const { isCopyHovering } = this.state;
        return (
            <div
                className={`Address-item animated fadeIn ${className}`}
                onClick={this.handleClick}
            >
                <div
                    className={`item-body ${
                        walletAddress.type === AddressType.Platform
                            ? "platform-type"
                            : "asset-type"
                    }`}
                >
                    <div>
                        <p className="address-name mb-0">
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
                            className="ml-3"
                            src={isCopyHovering ? copyBtnHover : copyBtn}
                            onMouseOver={this.hoverCopyBtn}
                            onMouseOut={this.outCopyBtn}
                        />
                    </CopyToClipboard>
                </div>
                {walletAddress.type === AddressType.Platform && (
                    <div className="platform-account">
                        {availableQuark ? (
                            <span className="number balance">
                                {changeQuarkToCCCString(availableQuark)} CCC
                            </span>
                        ) : (
                            <span className="number balance">Loading...</span>
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
            autoClose: 1000,
            closeButton: false,
            hideProgressBar: true
        });
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { walletAddress } = props;
    const availableQuark =
        state.accountReducer.availableQuark[walletAddress.address];
    return {
        availableQuark
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(AddressItem));
