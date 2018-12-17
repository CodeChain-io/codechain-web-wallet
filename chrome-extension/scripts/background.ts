import { wrapStore } from "react-chrome-redux";
import { applyMiddleware, createStore } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import rootReducer from "../../src/redux";
import APIHandler from "./APIHandler";

const store = createStore(rootReducer, applyMiddleware(thunk, logger));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handler(request, sender, sendResponse);
  return true;
});

const apiHandler = new APIHandler(store);

const handler = async (request, sender, sendResponse) => {
  apiHandler.handle(request, sender, sendResponse);
};

wrapStore(store, { portName: "WALLET_APP" });
