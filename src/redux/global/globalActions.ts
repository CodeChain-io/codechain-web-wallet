import { Action as ReduxAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "..";
import { NetworkId } from "../../model/address";
import {
    clearPassphrase,
    saveNetworkId,
    savePassphrase
} from "../../utils/storage";
import { ActionType as WalletActions } from "../wallet/walletActions";

export type Action = Login | ClearData | Logout | UpdateNetwork;

export enum ActionType {
    Login = "Login",
    ClearData = "ClearData",
    Logout = "Logout",
    UpdateNetwork = "UpdateNetwork"
}

export interface Login {
    type: ActionType.Login;
    data: {
        passphrase: string;
    };
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
        dispatch: ThunkDispatch<ReducerConfigure, void, ReduxAction>,
        getState: () => ReducerConfigure
    ) => {
        dispatch({
            type: WalletActions.ClearWalletAddresses
        });
        dispatch({
            type: ActionType.UpdateNetwork,
            data: {
                networkId
            }
        });
        saveNetworkId(networkId);
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

export default {
    login,
    logout,
    clearData,
    updateNetworkId
};
