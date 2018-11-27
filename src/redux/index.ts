import { combineReducers } from "redux";
import { assetInitState, assetReducer, AssetState } from "./asset/assetReducer";
import { chainInitState, chainReducer, ChainState } from "./chain/chainReducer";
import { ActionType } from "./global/globalActions";
import {
    globalInitState,
    globalReducer,
    GlobalState
} from "./global/globalReducer";
import {
    walletInitState,
    walletReducer,
    WalletState
} from "./wallet/walletReducer";

export interface ReducerConfigure {
    globalReducer: GlobalState;
    walletReducer: WalletState;
    assetReducer: AssetState;
    chainReducer: ChainState;
}

const appReducer = combineReducers({
    globalReducer,
    walletReducer,
    assetReducer,
    chainReducer
});

const rootReducer = (state: any, action: any) => {
    if (action.type === ActionType.ClearData) {
        state = {
            globalReducer: globalInitState,
            walletReducer: walletInitState,
            transactionReducer: chainInitState,
            assetReducer: assetInitState
        };
    }
    return appReducer(state, action);
};

export default rootReducer;
