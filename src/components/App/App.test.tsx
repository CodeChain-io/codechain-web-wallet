import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { appReducer } from "../../reducers";
import App from "./App";

it("renders without crashing", () => {
    const div = document.createElement("div");
    const store = createStore(appReducer);
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        div
    );
    ReactDOM.unmountComponentAtNode(div);
});
