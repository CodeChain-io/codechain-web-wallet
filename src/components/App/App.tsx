import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faAngleLeft,
    faAngleRight,
    faArrowAltCircleDown,
    faArrowCircleDown,
    faArrowCircleRight,
    faArrowLeft,
    faArrowRight,
    faBars,
    faChevronLeft,
    faCircle,
    faCopy,
    faEllipsisH,
    faExchangeAlt,
    faExclamationCircle,
    faFileDownload,
    faInfoCircle,
    faLock,
    faPlus,
    faPlusCircle,
    faQuestionCircle,
    faRedoAlt,
    faTimes,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import i18n from "../../i18next";
import { ReducerConfigure } from "../../redux";
import Account from "../Account/Account";
import AddressList from "../AddressList/AddressList";
import AssetDetail from "../AssetDetail/AssetDetail";
import AssetList from "../AssetList/AssetList";
import CreateWallet from "../CreateWallet/CreateWallet";
import Footer from "../Footer";
import Header from "../Header/Header";
import Login from "../Login/Login";
import MintAsset from "../MintAsset";
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
    faArrowCircleDown,
    faExchangeAlt,
    faCopy,
    faArrowRight,
    faRedoAlt,
    faExclamationCircle,
    faQuestionCircle,
    faChevronLeft,
    faAngleRight,
    faAngleDoubleRight,
    faAngleLeft,
    faAngleDoubleLeft,
    faLock
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
            <I18nextProvider i18n={i18n}>
                <Router basename={process.env.PUBLIC_URL || "/"}>
                    <div id="app" className="app" ref={this.appRef}>
                        <ToastContainer className="custom-toast" />
                        {passphrase && <Header />}
                        <div className="app-container">
                            <Switch>
                                <Route path="/login" component={Login} />
                                <Route
                                    path="/selectKeyfile"
                                    component={SelectKeyFile}
                                />
                                <Route
                                    path="/createWallet"
                                    component={CreateWallet}
                                />
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
                                    exact={true}
                                    path="/mint"
                                    component={MintAsset}
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
                        <Footer />
                    </div>
                </Router>
            </I18nextProvider>
        );
    }
}

const mapStateToProps = (state: ReducerConfigure) => ({
    passphrase: state.globalReducer.passphrase
});
export default connect(mapStateToProps)(App);
