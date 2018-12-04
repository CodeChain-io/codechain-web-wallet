import * as React from "react";
import LoadingBar from "react-redux-loading-bar";
import { Link } from "react-router-dom";
import "./Header.css";
import * as Logo from "./img/logo.svg";
import MenuButton from "./MenuButton/MenuButton";
import NetworkButton from "./NetworkButton/NetworkButton";

class Header extends React.Component {
    public render() {
        return (
            <div className="Header" key="header">
                <div className="header-container d-flex align-items-center h-100">
                    <Link to="/">
                        <img src={Logo} className="logo" />
                    </Link>
                    <NetworkButton className="ml-auto" />
                    <MenuButton className="" />
                </div>
                <LoadingBar className="loading-bar" />
            </div>
        );
    }
}
export default Header;
