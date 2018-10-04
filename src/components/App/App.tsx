import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "../Header/Header";
import Login from "../Login/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import WalletList from "../WalletList/WalletList";
import "./App.css";

class App extends React.Component {
    public render() {
        return (
            <Router>
                <div id="app" className="app">
                    <Header />
                    <div className="content-container">
                        <Route path="/login" component={Login} />
                        <PrivateRoute
                            exact={true}
                            path="/"
                            component={WalletList}
                        />
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
