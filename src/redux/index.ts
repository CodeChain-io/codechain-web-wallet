import { combineReducers } from "redux";
import { assetReducer, AssetState } from "./asset/assetReducer";
import { globalReducer, GlobalState } from "./global/globalReducer";
import {
    transactionReducer,
    TransactionState
} from "./transaction/transactionReducer";
import { walletReducer, WalletState } from "./wallet/walletReducer";

export interface ReducerConfigure {
    globalReducer: GlobalState;
    walletReducer: WalletState;
    assetReducer: AssetState;
    transactionReducer: TransactionState;
}

const rootReducer = combineReducers({
    globalReducer,
    walletReducer,
    assetReducer,
    transactionReducer
});
export default rootReducer;
