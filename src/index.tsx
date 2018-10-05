import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension/logOnlyInProduction";
import App from "./components/App/App";
import "./index.css";
import { appReducer } from "./reducers";
import registerServiceWorker from "./registerServiceWorker";

const store = createStore(appReducer, devToolsEnhancer({}));
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
