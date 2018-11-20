import * as React from "react";
import { connect } from "react-redux";
import { IndexLinkContainer } from "react-router-bootstrap";
import {
    Container,
    Nav,
    Navbar,
    NavbarBrand,
    NavItem,
    NavLink
} from "reactstrap";
import { Dispatch } from "redux";
import { clearWallet } from "../../model/wallet";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/global/actions";
import "./Header.css";
import * as Logo from "./img/logo.png";

interface StateProps {
    isAuthenticated: boolean;
}
interface DispatchProps {
    logout: () => void;
}

type Props = DispatchProps & StateProps;
class Header extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public render() {
        const { isAuthenticated } = this.props;
        return (
            <div className="Header">
                <Navbar color="dark" dark={true} expand="md">
                    <Container>
                        <IndexLinkContainer to="/">
                            <NavbarBrand>
                                <div className="flex align-items-center">
                                    <img src={Logo} className="logo" />
                                    <span className="logo-text">
                                        <span className="codechain">
                                            CodeChain
                                        </span>{" "}
                                        Wallet
                                    </span>
                                </div>
                            </NavbarBrand>
                        </IndexLinkContainer>
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
    private handleLogout = async () => {
        await clearWallet();
        this.props.logout();
    };
}
const mapStateToProps = (state: ReducerConfigure) => ({
    isAuthenticated: state.globalReducer.isAuthenticated
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    logout: () => {
        dispatch(actions.logout());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
