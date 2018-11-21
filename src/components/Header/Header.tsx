import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/global/globalActions";
import "./Header.css";
import * as Logo from "./img/codechain-logo.png";

interface StateProps {
    isAuthenticated: boolean;
}
interface DispatchProps {
    toggleMenu: () => void;
}

type Props = DispatchProps & StateProps;
class Header extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public render() {
        return (
            <div className="Header">
                <div className="d-flex align-items-center h-100">
                    <div className="menu-btn" onClick={this.handleToggleMenu}>
                        <FontAwesomeIcon icon="bars" />
                    </div>
                    <Link to="/">
                        <img src={Logo} className="logo" />
                    </Link>
                </div>
            </div>
        );
    }

    private handleToggleMenu = async () => {
        this.props.toggleMenu();
    };
}
const mapStateToProps = (state: ReducerConfigure) => ({
    isAuthenticated: state.globalReducer.isAuthenticated
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    toggleMenu: () => {
        dispatch(actions.toggleMenu());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
