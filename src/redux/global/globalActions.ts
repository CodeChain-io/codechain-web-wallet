import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { clearKeystore } from "../../model/keystore";

export type Action = Login | ToggleMenu | ClearData | Logout;

export enum ActionType {
    Login = 1000,
    ClearData,
    ToggleMenu,
    Logout
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

export interface Logout {
    type: ActionType.Logout;
}

const login = (): Login => ({
    type: ActionType.Login
});

const logout = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        dispatch(clearData());
        dispatch({
            type: ActionType.Logout
        });
    };
};

const clearData = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        await clearKeystore();
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
    toggleMenu,
    clearData
};
