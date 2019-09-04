import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { AddressType, NetworkId, WalletAddress } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import "./AddressItem.css";

import { U64 } from "codechain-sdk/lib/core/classes";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import accountActions from "../../../redux/account/accountActions";
import assetActions from "../../../redux/asset/assetActions";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import copyBtnHover from "./img/copy-hover.svg";
import copyBtn from "./img/copy.svg";

interface OwnProps {
    walletAddress: WalletAddress;
    className?: string | null;
}
interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    fetchAvailableAssets: (address: string) => void;
}
interface StateProps {
    availableQuark?: U64 | null;
    availableAssets?:
        | {
              assetType: string;
              quantities: U64;
          }[]
        | null;
    networkId: NetworkId;
}
interface State {
    isCopyHovering: boolean;
}

type Props = WithTranslation &
    RouteComponentProps &
    OwnProps &
    DispatchProps &
    StateProps;

class AddressItem extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCopyHovering: false
        };
    }
    public componentDidMount() {
        const {
            walletAddress,
            fetchAvailableQuark,
            fetchAvailableAssets
        } = this.props;
        if (walletAddress.type === AddressType.Platform) {
            fetchAvailableQuark(walletAddress.address);
        }
        if (walletAddress.type === AddressType.Asset) {
            fetchAvailableAssets(walletAddress.address);
        }
    }
    public render() {
        const {
            walletAddress,
            className,
            availableQuark,
            availableAssets,
            networkId
        } = this.props;
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
                            <Trans
                                i18nKey="main:address"
                                values={{
                                    index: walletAddress.index + 1
                                }}
                            />
                        </p>
                    </div>
                    <span className="address-text mono">
                        {walletAddress.address.slice(0, 10)}
                        ...
                        {walletAddress.address.slice(
                            walletAddress.address.length - 10,
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
                            alt={"copy"}
                            onMouseOver={this.hoverCopyBtn}
                            onMouseOut={this.outCopyBtn}
                        />
                    </CopyToClipboard>
                </div>
                {walletAddress.type === AddressType.Platform && (
                    <div className="platform-account">
                        {availableQuark ? (
                            <span className="number balance">
                                {availableQuark.toLocaleString()} CCC
                            </span>
                        ) : (
                            <span className="number balance">
                                <Trans i18nKey="main:address_loading" />
                            </span>
                        )}
                    </div>
                )}
                {walletAddress.type === AddressType.Asset && (
                    <div className="platform-account">
                        {availableAssets ? (
                            availableAssets.length > 0 ? (
                                [
                                    availableAssets.slice(0, 3).map(a => (
                                        <div
                                            className="asset-image"
                                            key={a.assetType}
                                        >
                                            <ImageLoader
                                                isAssetImage={true}
                                                data={a.assetType}
                                                size={37}
                                                networkId={networkId}
                                            />
                                        </div>
                                    )),
                                    availableAssets.length > 3 && (
                                        <span key="others" className="balance">
                                            + {availableAssets.length - 3}
                                        </span>
                                    )
                                ]
                            ) : (
                                <span className="balance">
                                    <Trans i18nKey="main:asset.no_asset" />
                                </span>
                            )
                        ) : (
                            <span className="number balance">
                                <Trans i18nKey="main:address_loading" />
                            </span>
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
        toast.info(this.props.t("main:copied"), {
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
    const availableAssets =
        state.assetReducer.availableAssets[walletAddress.address];
    return {
        availableQuark,
        availableAssets,
        networkId: state.globalReducer.networkId
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    },
    fetchAvailableAssets: (address: string) => {
        dispatch(assetActions.fetchAvailableAssets(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withTranslation()(AddressItem)));
