import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { NetworkId } from "../../model/address";
import { clearPassphrase, savePassphrase } from "../../utils/storage";

export type Action = Login | ToggleMenu | ClearData | Logout | UpdateNetwork;

export enum ActionType {
    Login = 1000,
    ClearData,
    ToggleMenu,
    Logout,
    UpdateNetwork
}

export interface Login {
    type: ActionType.Login;
    data: {
        passphrase: string;
    };
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

export interface UpdateNetwork {
    type: ActionType.UpdateNetwork;
    data: {
        networkId: NetworkId;
    };
}

const updateNetworkId = (networkId: NetworkId) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        dispatch({
            type: ActionType.UpdateNetwork,
            data: {
                networkId
            }
        });
    };
};

const login = (passphrase: string) => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        savePassphrase(passphrase);
        dispatch({
            type: ActionType.Login,
            data: {
                passphrase
            }
        });
    };
};

const logout = () => {
    return async (
        dispatch: ThunkDispatch<ReducerConfigure, void, Action>,
        getState: () => ReducerConfigure
    ) => {
        clearPassphrase();
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
        dispatch({
            type: ActionType.ClearData
        });
    };
};

const toggleMenu = (): ToggleMenu => ({
    type: ActionType.ToggleMenu
});

export default {
    login,
    logout,
    toggleMenu,
    clearData,
    updateNetworkId
};
