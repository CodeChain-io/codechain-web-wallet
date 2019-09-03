import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import {
    applyMiddleware as applyMiddlewareChrome,
    Store
} from "react-chrome-redux";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import logger from "redux-logger";
import thunk from "redux-thunk";
import App from "./components/App/App";
import rootReducer from "./redux";
import { unregister } from "./registerServiceWorker";
import "./styles/index.css";

if (process.env.REACT_APP_BUILD_TARGET === "chrome-extension") {
    const store = new Store({
        portName: "WALLET_APP"
    });

    // Apply middleware to proxy store
    const middleware = [thunk, logger];
    const storeWithMiddleware = applyMiddlewareChrome(store, ...middleware);

    store.ready().then(() => {
        ReactDOM.render(
            <Provider store={storeWithMiddleware}>
                <App />
            </Provider>,
            document.getElementById("root") as HTMLElement
        );
    });
} else {
    const composeEnhancers = composeWithDevTools({});
    const store = createStore(
        rootReducer,
        composeEnhancers(applyMiddleware(thunk))
    );
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById("root") as HTMLElement
    );
}

unregister();
