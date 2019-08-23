import { loadingBarReducer } from "react-redux-loading-bar";
import { combineReducers } from "redux";
import { accountReducer, AccountState } from "./account/accountReducer";
import { assetReducer, AssetState } from "./asset/assetReducer";
import { chainReducer, ChainState } from "./chain/chainReducer";
import { exchangeReducer, ExchangeState } from "./exchange/exchangeReducer";
import { ActionType } from "./global/globalActions";
import { globalReducer, GlobalState } from "./global/globalReducer";
import { walletReducer, WalletState } from "./wallet/walletReducer";

export interface ReducerConfigure {
    globalReducer: GlobalState;
    walletReducer: WalletState;
    assetReducer: AssetState;
    chainReducer: ChainState;
    accountReducer: AccountState;
    exchangeReducer: ExchangeState;
}

const appReducer = combineReducers({
    globalReducer,
    walletReducer,
    assetReducer,
    chainReducer,
    accountReducer,
    exchangeReducer,
    loadingBar: loadingBarReducer
});

const rootReducer = (state: any, action: any) => {
    if (action.type === ActionType.ClearData) {
        state = undefined;
    }
    return appReducer(state, action);
};

export default rootReducer;
