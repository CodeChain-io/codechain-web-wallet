import React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../../redux";
import globalActions from "../../../redux/global/globalActions";

class WalletSaver extends React.Component<any, any> {
    public timer: NodeJS.Timeout | null = null;

    public componentDidMount() {
        this.startTimer();
        document.addEventListener("mousedown", this.handleClickOutside);
        document.addEventListener("touchend", this.handleTouchOutside);
        document.addEventListener("keydown", this.handleKeyDown);
    }

    public componentWillUnmount() {
        this.clearTimer();
        document.removeEventListener("mousedown", this.handleClickOutside);
        document.removeEventListener("touchend", this.handleTouchOutside);
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    public render() {
        return null;
    }

    private handleClickOutside = () => {
        this.resetTimer();
    };

    private handleTouchOutside = () => {
        this.resetTimer();
    };

    private handleKeyDown = () => {
        this.resetTimer();
    };

    private startTimer = () => {
        const { logout } = this.props;
        this.clearTimer();
        this.timer = setTimeout(() => {
            logout();
        }, 60 * 10 * 1000);
    };

    private clearTimer = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    };

    private resetTimer = () => {
        this.startTimer();
    };
}

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    logout: () => {
        dispatch(globalActions.logout());
    }
});
export default connect(
    undefined,
    mapDispatchToProps
)(WalletSaver);
