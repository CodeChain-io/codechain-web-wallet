import { Action, ActionType } from "./globalActions";

export interface GlobalState {
    isAuthenticated: boolean;
    isSideMenuOpen: boolean;
}

export const globalInitState: GlobalState = {
    isAuthenticated: false,
    isSideMenuOpen: false
};

export const globalReducer = (state = globalInitState, action: Action) => {
    switch (action.type) {
        case ActionType.Login:
            return {
                ...state,
                isAuthenticated: true
            };
        case ActionType.ToggleMenu:
            return {
                ...state,
                isSideMenuOpen: !state.isSideMenuOpen
            };
    }
    return state;
};
