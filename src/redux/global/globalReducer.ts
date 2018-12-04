import { NetworkId } from "../../model/address";
import { getPassphrase } from "../../utils/storage";
import { Action, ActionType } from "./globalActions";

export interface GlobalState {
    passphrase?: string | null;
    networkId: NetworkId;
}

export const globalInitState: GlobalState = {
    passphrase: getPassphrase(),
    networkId: "tc"
};

export const globalReducer = (state = globalInitState, action: Action) => {
    switch (action.type) {
        case ActionType.Login:
            return {
                ...state,
                passphrase: action.data.passphrase
            };
        case ActionType.Logout:
            return {
                ...state,
                passphrase: undefined
            };
        case ActionType.UpdateNetwork:
            return {
                ...state,
                networkId: action.data.networkId
            };
    }
    return state;
};
