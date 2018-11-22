import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { clearWallet } from "../../model/wallet";

export type Action = Login | ToggleMenu | ClearData;

export enum ActionType {
    Login = "login",
    ClearData = "clear_data",
    ToggleMenu = "toggle_menu"
}

export interface Login {
    type: ActionType.Login;
}

export interface ToggleMenu {
    type: ActionType.ToggleMenu;
}

export interface ClearData {
    type: ActionType.ClearData;
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
        setTimeout(() => {
            dispatch({
                type: ActionType.ClearData
            });
        }, 100);
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
