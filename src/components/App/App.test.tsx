import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../../redux";
import App from "./App";

it("renders without crashing", () => {
    const div = document.createElement("div");
    const store = createStore(rootReducer);
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        div
    );
    ReactDOM.unmountComponentAtNode(div);
});
