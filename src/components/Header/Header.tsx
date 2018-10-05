import * as React from "react";
import { connect } from "react-redux";
import {
    Container,
    Nav,
    Navbar,
    NavbarBrand,
    NavItem,
    NavLink
} from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { IRootState } from "../../reducers";
import "./Header.css";
import * as Logo from "./img/logo.png";

interface IStateProps {
    isAuthenticated: boolean;
}
interface IDispatchProps {
    logout: () => void;
}

type IProps = IDispatchProps & IStateProps;
class Header extends React.Component<IProps, any> {
    public constructor(props: IProps) {
        super(props);
    }
    public render() {
        const { isAuthenticated } = this.props;
        return (
            <div className="Header">
                <Navbar color="dark" dark={true} expand="md">
                    <Container>
                        <NavbarBrand href="/">
                            <div className="flex align-items-center">
                                <img src={Logo} className="logo" />
                                <span className="logo-text">
                                    CodeChain Wallet
                                </span>
                            </div>
                        </NavbarBrand>
                        <Nav navbar={true} className="ml-auto">
                            {isAuthenticated && (
                                <NavItem className="ml-auto">
                                    <NavLink
                                        href="#"
                                        onClick={this.handleLogout}
                                    >
                                        Logout
                                    </NavLink>
                                </NavItem>
                            )}
                        </Nav>
                    </Container>
                </Navbar>
            </div>
        );
    }
    private handleLogout = () => {
        this.props.logout();
    };
}
const mapStateToProps = (state: IRootState) => ({
    isAuthenticated: state.isAuthenticated
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    logout: () => {
        dispatch(Actions.logout());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
