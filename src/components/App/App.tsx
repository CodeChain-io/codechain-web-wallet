import * as React from "react";
import * as ReactModal from "react-modal";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "../Header/Header";
import Login from "../Login/Login";
import NotFound from "../NotFound/NotFound";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import WalletList from "../WalletList/WalletList";
import "./App.css";

class App extends React.Component {
    public componentDidMount() {
        ReactModal.setAppElement("#app");
    }
    public render() {
        return (
            <Router>
                <div id="app" className="app">
                    <Header />
                    <div className="content-container">
                        <Switch>
                            <Route path="/login" component={Login} />
                            <PrivateRoute
                                exact={true}
                                path="/"
                                component={WalletList}
                            />
                            <Route component={NotFound} />
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
