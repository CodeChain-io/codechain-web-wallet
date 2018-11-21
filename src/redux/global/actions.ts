import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { clearWallet } from "../../model/wallet";

export type Action = Login | Logout | ToggleMenu;

export enum ActionType {
    Login = "login",
    Logout = "logout",
    ToggleMenu = "toggle_menu"
}

export interface Login {
    type: ActionType.Login;
}

export interface Logout {
    type: ActionType.Logout;
}

export interface ToggleMenu {
    type: ActionType.ToggleMenu;
}

const login = (): Login => ({
    type: ActionType.Login
});

const logout = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        await clearWallet();
        dispatch({
            type: ActionType.Logout
        });
    };
};

const toggleMenu = (): ToggleMenu => ({
    type: ActionType.ToggleMenu
});

export default {
    login,
    logout,
    toggleMenu
};
