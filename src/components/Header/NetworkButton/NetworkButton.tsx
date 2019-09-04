import React from "react";
import { connect } from "react-redux";
import { Popover, PopoverBody } from "reactstrap";
import { Action } from "redux";
import { NetworkId } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import { getNetworkNameById } from "../../../utils/network";
import MainNet from "./img/mainnet.svg";
import TestNet from "./img/testnet.svg";

import _ from "lodash";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ThunkDispatch } from "redux-thunk";
import globalActions from "../../../redux/global/globalActions";
import "./NetworkButton.css";

interface OwnProps {
    className?: string;
}

interface StateProps {
    networkId: NetworkId;
}

interface State {
    popoverOpen: boolean;
}

interface DispatchProps {
    updateNetworkId: (networkId: NetworkId) => void;
}

type Props = RouteComponentProps & StateProps & OwnProps & DispatchProps;
class NetworkButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            popoverOpen: false
        };
    }
    public render() {
        const { networkId, className } = this.props;
        return (
            <div
                className={`Network-button ${className}`}
                onClick={this.toggle}
                id="network-button"
            >
                <div className="d-flex align-items-center network-btn">
                    <div className="mr-1">{getNetworkNameById(networkId)}</div>
                    <img
                        src={networkId === "cc" ? MainNet : TestNet}
                        alt={"network"}
                    />
                </div>
                <Popover
                    placement="bottom"
                    isOpen={this.state.popoverOpen}
                    target="network-button"
                    toggle={this.toggle}
                >
                    <PopoverBody className="popover-select-list">
                        <ul className="list-unstyled mb-0">
                            <li onClick={_.partial(this.chagneNetworkId, "cc")}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">MAINNET</span>
                                    <img src={MainNet} alt={"mainnet"} />
                                </div>
                            </li>
                            {/*
                            <li onClick={_.partial(this.chagneNetworkId, "tc")}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">HUSKY</span>
                                    <img src={TestNet} />
                                </div>
                            </li>
                            <li onClick={_.partial(this.chagneNetworkId, "sc")}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">SALUKI</span>
                                    <img src={TestNet} />
                                </div>
                            </li>
                            */}
                            <li onClick={_.partial(this.chagneNetworkId, "wc")}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">TESTNET</span>
                                    <img src={TestNet} alt={"testnet"} />
                                </div>
                            </li>
                        </ul>
                    </PopoverBody>
                </Popover>
            </div>
        );
    }
    private toggle = () => {
        this.setState({ popoverOpen: !this.state.popoverOpen });
    };
    private chagneNetworkId = (networkId: NetworkId) => {
        const { updateNetworkId, networkId: currentNetworkId } = this.props;
        const { history } = this.props;
        this.toggle();
        if (networkId === currentNetworkId) {
            return;
        }
        updateNetworkId(networkId);
        history.replace("/");
    };
}
const mapStateToProps = (state: ReducerConfigure) => ({
    networkId: state.globalReducer.networkId,
    passphrase: state.globalReducer.passphrase
});
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    updateNetworkId: (networkId: NetworkId) => {
        dispatch(globalActions.updateNetworkId(networkId));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(NetworkButton));
