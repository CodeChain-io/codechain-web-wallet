import { combineReducers } from "redux";
import { assetReducer, AssetState } from "./asset/reducer";
import { globalReducer, GlobalState } from "./global/reducer";
import { walletReducer, WalletState } from "./wallet/reducer";

export interface ReducerConfigure {
    globalReducer: GlobalState;
    walletReducer: WalletState;
    assetReducer: AssetState;
}

const rootReducer = combineReducers({
    globalReducer,
    walletReducer,
    assetReducer
});
export default rootReducer;
