import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { clearWallet } from "../../model/wallet";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/global/actions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WalletAddress } from "../../model/address";
import "./SideMenu.css";

interface StateProps {
    isAuthenticated: boolean;
    walletName?: string | null;
    assetAddresses: WalletAddress[];
    platformAddresses: WalletAddress[];
}
interface DispatchProps {
    logout: () => void;
    toggleMenu: () => void;
}

type Props = DispatchProps & StateProps;
class SideMenu extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public render() {
        const {
            isAuthenticated,
            walletName,
            platformAddresses,
            assetAddresses
        } = this.props;
        return (
            <div className="side-menu">
                <div className="left-arrow" onClick={this.handleToggleMenu}>
                    <FontAwesomeIcon icon="chevron-left" />
                </div>
                <div className="title-container">
                    <span>KEYFILE</span>
                    <h3>{walletName}</h3>
                    <hr />
                    <p className="mb-0">
                        {platformAddresses.length} Platform address
                    </p>
                    <p>{assetAddresses.length} Asset address</p>
                    <div className="mt-5">
                        <button className="btn btn-primary w-100 text-center">
                            Add address
                            <FontAwesomeIcon
                                className="ml-2"
                                icon="plus-circle"
                            />
                        </button>
                    </div>
                    <div className="mt-3">
                        <button className="btn btn-primary w-100 text-center">
                            Export keyfile
                            <FontAwesomeIcon
                                className="ml-2"
                                icon="arrow-alt-circle-down"
                            />
                        </button>
                    </div>
                </div>
                {isAuthenticated && (
                    <div onClick={this.handleLogout} className="logout-btn">
                        <h5>Logout</h5>
                    </div>
                )}
            </div>
        );
    }

    private handleLogout = async () => {
        await clearWallet();
        this.props.logout();
    };

    private handleToggleMenu = async () => {
        this.props.toggleMenu();
    };
}

const mapStateToProps = (state: ReducerConfigure) => ({
    isAuthenticated: state.globalReducer.isAuthenticated,
    walletName: state.walletReducer.walletName,
    assetAddresses: state.walletReducer.assetAddresses,
    platformAddresses: state.walletReducer.platformAddresses
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    logout: () => {
        dispatch(actions.logout());
    },
    toggleMenu: () => {
        dispatch(actions.toggleMenu());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SideMenu);
