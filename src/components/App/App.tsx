import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowAltCircleDown,
    faBars,
    faChevronLeft,
    faFileDownload,
    faPlus,
    faPlusCircle,
    faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import * as ReactModal from "react-modal";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ReducerConfigure } from "../../redux";
import Account from "../Account/Account";
import AddressList from "../AddressList/AddressList";
import AssetDetail from "../AssetDetail/AssetDetail";
import AssetList from "../AssetList/AssetList";
import Header from "../Header/Header";
import Login from "../Login/Login";
import NotFound from "../NotFound/NotFound";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import SendAsset from "../SendAsset/SendAsset";
import SideMenu from "../SideMenu/SideMenu";
import "./App.css";

library.add(
    faPlus,
    faTrashAlt,
    faFileDownload,
    faBars,
    faChevronLeft,
    faArrowAltCircleDown,
    faPlusCircle
);

interface StateProps {
    isAuthenticated: boolean;
    isSideMenuOpen: boolean;
}
type Props = StateProps;
class App extends React.Component<Props, any> {
    private appRef: React.RefObject<any>;
    public constructor(props: any) {
        super(props);
        this.appRef = React.createRef();
    }
    public componentDidMount() {
        ReactModal.setAppElement(this.appRef.current);
    }
    public render() {
        const { isAuthenticated, isSideMenuOpen } = this.props;
        return (
            <Router>
                <div id="app" className="app" ref={this.appRef}>
                    {isAuthenticated && <Header />}
                    <div className="d-flex">
                        <ReactCSSTransitionGroup
                            transitionName="slide-menu-effect"
                            transitionEnterTimeout={150}
                            transitionLeaveTimeout={150}
                        >
                            {isAuthenticated && isSideMenuOpen && <SideMenu />}
                        </ReactCSSTransitionGroup>
                        <div className="content-container">
                            <Switch>
                                <Route path="/login" component={Login} />
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
                                <PrivateRoute
                                    path="/:address/:assetType/send"
                                    component={SendAsset}
                                />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = (state: ReducerConfigure) => ({
    isAuthenticated: state.globalReducer.isAuthenticated,
    isSideMenuOpen: state.globalReducer.isSideMenuOpen
});
export default connect(mapStateToProps)(App);
