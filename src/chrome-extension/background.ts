import { wrapStore } from "react-chrome-redux";
import { createStore } from "redux";
import rootReducer from "../redux";

const store = createStore(rootReducer);

wrapStore(store, { portName: "WALLET_APP" });
