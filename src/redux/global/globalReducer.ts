import { Action, ActionType } from "./globalActions";

export interface GlobalState {
    isAuthenticated: boolean;
    isSideMenuOpen: boolean;
}

const initialState: GlobalState = {
    isAuthenticated: false,
    isSideMenuOpen: false
};

export const globalReducer = (state = initialState, action: Action) => {
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
    }
    return state;
};
