import { Action } from "./actions";
import { WalletAddress } from "./model/address";

export interface IRootState {
    isAuthenticated: boolean;
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
}

const initialState: IRootState = {
    isAuthenticated: false,
    platformAddresses: [],
    assetAddresses: []
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
        case "UpdateWalletAddresses":
            return {
                ...state,
                platformAddresses: action.data.platformAddresses,
                assetAddresses: action.data.assetAddresses
            };
    }
    return state;
};
