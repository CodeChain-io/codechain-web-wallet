import { wrapStore } from "react-chrome-redux";
import { applyMiddleware, createStore } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import rootReducer from "../../src/redux";

const store = createStore(rootReducer, applyMiddleware(thunk, logger));

wrapStore(store, { portName: "WALLET_APP" });
