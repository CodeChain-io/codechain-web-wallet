import { Action } from "./actions";

export interface IRootState {
    isAuthenticated: boolean;
}

const initialState: IRootState = {
    isAuthenticated: false
};

export const appReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case "Login":
            return {
                ...state,
                isAuthenticated: true
            };
        case "Logout":
            return {
                ...state,
                isAuthenticated: false
            };
    }
    return state;
};
