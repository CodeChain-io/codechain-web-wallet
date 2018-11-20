import { WalletAddress } from "../../model/address";
import { Action, ActionType } from "./actions";

export interface WalletState {
    platformAddresses: WalletAddress[];
    assetAddresses: WalletAddress[];
    walletName?: string | null;
}

const initialState: WalletState = {
    platformAddresses: [],
    assetAddresses: [],
    walletName: undefined
};

export const walletReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case ActionType.UpdateWalletAddresses:
            return {
                ...state,
                platformAddresses: action.data.platformAddresses,
                assetAddresses: action.data.assetAddresses
            };
        case ActionType.UpdateWalletName:
            return {
                ...state,
                walletName: action.data
            };
    }
    return state;
};
