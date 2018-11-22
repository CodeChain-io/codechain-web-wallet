import { combineReducers } from "redux";
import { assetInitState, assetReducer, AssetState } from "./asset/assetReducer";
import { ActionType } from "./global/globalActions";
import {
    globalInitState,
    globalReducer,
    GlobalState
} from "./global/globalReducer";
import {
    transactionReducer,
    TransactionState,
    txInitState
} from "./transaction/transactionReducer";
import {
    walletInitState,
    walletReducer,
    WalletState
} from "./wallet/walletReducer";

export interface ReducerConfigure {
    globalReducer: GlobalState;
    walletReducer: WalletState;
    assetReducer: AssetState;
    transactionReducer: TransactionState;
}

const appReducer = combineReducers({
    globalReducer,
    walletReducer,
    assetReducer,
    transactionReducer
});

const rootReducer = (state: any, action: any) => {
    if (action.type === ActionType.ClearData) {
        state = {
            globalReducer: globalInitState,
            walletReducer: walletInitState,
            transactionReducer: txInitState,
            assetReducer: assetInitState
        };
    }
    return appReducer(state, action);
};

export default rootReducer;
