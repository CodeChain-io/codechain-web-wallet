import React from "react";
import LoadingBar from "react-redux-loading-bar";
import { Link } from "react-router-dom";
import "./Header.css";
import Logo from "./img/logo.svg";
import MenuButton from "./MenuButton/MenuButton";
import NetworkButton from "./NetworkButton/NetworkButton";
import WalletSaver from "./WalletSaver";

export default class Header extends React.Component {
    public render() {
        return (
            <div className="Header" key="header">
                <div className="header-container d-flex align-items-center h-100">
                    <Link to="/">
                        <img src={Logo} alt={"logo"} className="logo" />
                    </Link>
                    <WalletSaver />
                    <NetworkButton className="ml-auto" />
                    <MenuButton className="" />
                </div>
                <LoadingBar className="loading-bar" />
            </div>
        );
    }
}
