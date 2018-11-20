import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension/logOnlyInProduction";
import App from "./components/App/App";
import rootReducer from "./redux";
import registerServiceWorker from "./registerServiceWorker";
import "./styles/index.css";

const store = createStore(rootReducer, devToolsEnhancer({}));
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
registerServiceWorker();
