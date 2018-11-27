import { NetworkId } from "../../model/address";
import { Action, ActionType } from "./globalActions";

export interface GlobalState {
    isAuthenticated: boolean;
    isSideMenuOpen: boolean;
    networkId: NetworkId;
}

export const globalInitState: GlobalState = {
    isAuthenticated: false,
    isSideMenuOpen: false,
    networkId: "tc"
};

export const globalReducer = (state = globalInitState, action: Action) => {
    switch (action.type) {
        case ActionType.Login:
            return {
                ...state,
                isAuthenticated: true
            };
        case ActionType.Logout:
            return {
                ...state,
                isAuthenticated: false
            };
        case ActionType.ToggleMenu:
            return {
                ...state,
                isSideMenuOpen: !state.isSideMenuOpen
            };
        case ActionType.UpdateNetwork:
            return {
                ...state,
                networkId: action.data.networkId
            };
    }
    return state;
};
