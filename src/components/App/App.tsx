import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowAltCircleDown,
    faArrowCircleDown,
    faArrowCircleRight,
    faArrowLeft,
    faBars,
    faChevronLeft,
    faCircle,
    faEllipsisH,
    faFileDownload,
    faInfoCircle,
    faPlus,
    faPlusCircle,
    faTimes,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ReducerConfigure } from "../../redux";
import Account from "../Account/Account";
import AddressList from "../AddressList/AddressList";
import AssetDetail from "../AssetDetail/AssetDetail";
import AssetList from "../AssetList/AssetList";
import CreateWallet from "../CreateWallet/CreateWallet";
import Header from "../Header/Header";
import Login from "../Login/Login";
import NotFound from "../NotFound/NotFound";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import RestoreWallet from "../RestoreWallet/RestoreWallet";
import SelectKeyFile from "../SelectKeyFile/SelectKeyFile";
import "./App.css";

library.add(
    faPlus,
    faTrashAlt,
    faFileDownload,
    faBars,
    faChevronLeft,
    faArrowAltCircleDown,
    faPlusCircle,
    faTimes,
    faInfoCircle,
    faArrowLeft,
    faCircle,
    faEllipsisH,
    faArrowCircleRight,
    faArrowCircleDown
);

interface StateProps {
    passphrase?: string | null;
}
type Props = StateProps;
class App extends React.Component<Props, any> {
    private appRef: React.RefObject<any>;
    public constructor(props: any) {
        super(props);
        this.appRef = React.createRef();
    }
    public render() {
        const { passphrase } = this.props;
        return (
            <Router>
                <div id="app" className="app" ref={this.appRef}>
                    <ToastContainer className="custom-toast" />
                    {passphrase && <Header />}
                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route
                            path="/selectKeyfile"
                            component={SelectKeyFile}
                        />
                        <Route path="/createWallet" component={CreateWallet} />
                        <Route
                            path="/restoreWallet"
                            component={RestoreWallet}
                        />
                        <PrivateRoute
                            exact={true}
                            path="/"
                            component={AddressList}
                        />
                        <PrivateRoute
                            exact={true}
                            path="/index.html"
                            component={AddressList}
                        />
                        <PrivateRoute
                            path="/:address/assets"
                            component={AssetList}
                        />
                        <PrivateRoute
                            path="/:address/account"
                            component={Account}
                        />
                        <PrivateRoute
                            exact={true}
                            path="/:address/:assetType"
                            component={AssetDetail}
                        />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = (state: ReducerConfigure) => ({
    passphrase: state.globalReducer.passphrase
});
export default connect(mapStateToProps)(App);
