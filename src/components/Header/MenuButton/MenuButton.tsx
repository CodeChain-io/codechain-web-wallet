import * as React from "react";
import { connect } from "react-redux";
import { Popover, PopoverBody } from "reactstrap";
import { Action } from "redux";
import { NetworkId } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThunkDispatch } from "redux-thunk";
import globalActions from "../../../redux/global/globalActions";
import ExportBackupPopup from "../../ExportBackupPopup/ExportBackupPopup";
import "./MenuButton.css";

interface OwnProps {
    className?: string;
}

interface StateProps {
    networkId: NetworkId;
}

interface State {
    popoverOpen: boolean;
    exportPopupOpen: boolean;
}

interface DispatchProps {
    logout: () => void;
}

type Props = DispatchProps & StateProps & OwnProps;
class MenuButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            popoverOpen: false,
            exportPopupOpen: false
        };
    }
    public render() {
        const { className } = this.props;
        const { exportPopupOpen, popoverOpen } = this.state;
        return (
            <div
                className={`Menu-button ${className}`}
                onClick={this.toggle}
                id="menu-button"
            >
                {exportPopupOpen && (
                    <ExportBackupPopup
                        toggle={this.toggleExportPopup}
                        isOpen={exportPopupOpen}
                    />
                )}
                <div className="d-flex align-items-center network-btn">
                    <FontAwesomeIcon icon="ellipsis-h" />
                </div>
                <Popover
                    placement="bottom"
                    isOpen={popoverOpen}
                    target="menu-button"
                    toggle={this.toggle}
                >
                    <PopoverBody className="popover-select-list">
                        <ul className="list-unstyled mb-0">
                            <li onClick={this.handleSignout}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">Sign out</span>
                                    <FontAwesomeIcon icon="arrow-circle-right" />
                                </div>
                            </li>
                            <li onClick={this.openExportPopup}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <span className="mr-1">Backup phrase</span>
                                    <FontAwesomeIcon icon="arrow-circle-down" />
                                </div>
                            </li>
                        </ul>
                    </PopoverBody>
                </Popover>
            </div>
        );
    }
    public handleSignout = () => {
        const { logout } = this.props;
        logout();
    };
    private openExportPopup = () => {
        this.setState({
            exportPopupOpen: !this.state.exportPopupOpen,
            popoverOpen: false
        });
    };
    private toggle = () => {
        this.setState({ popoverOpen: !this.state.popoverOpen });
    };
    private toggleExportPopup = () => {
        this.setState({ exportPopupOpen: !this.state.exportPopupOpen });
    };
}
const mapStateToProps = (state: ReducerConfigure) => ({
    networkId: state.globalReducer.networkId,
    passphrase: state.globalReducer.passphrase
});
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    logout: () => {
        dispatch(globalActions.logout());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MenuButton);
