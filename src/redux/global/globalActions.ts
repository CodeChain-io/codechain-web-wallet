import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { NetworkId } from "../../model/address";
import { clearKeystore } from "../../model/keystore";

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
    clearData,
    updateNetworkId
};
