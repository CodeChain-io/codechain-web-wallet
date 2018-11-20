import * as React from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { Dispatch } from "redux";
import { isWalletExisted } from "../../model/wallet";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/global/actions";

interface State {
    checkedSessionStorage: boolean;
}
class PrivateRoute extends React.Component<any, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            checkedSessionStorage: false
        };
    }

    public componentDidUpdate() {
        const { isAuthenticated } = this.props;
        const { checkedSessionStorage } = this.state;
        if (!isAuthenticated && !checkedSessionStorage) {
            this.checkSessionStorage();
        }
    }

    public componentDidMount() {
        const { isAuthenticated } = this.props;
        const { checkedSessionStorage } = this.state;
        if (!isAuthenticated && !checkedSessionStorage) {
            this.checkSessionStorage();
        }
    }

    public render() {
        const { isAuthenticated, component: Component, ...rest } = this.props;
        const { checkedSessionStorage } = this.state;
        return (
            <Route
                {...rest}
                // tslint:disable-next-line:jsx-no-lambda
                render={props =>
                    isAuthenticated ? (
                        <Component {...props} />
                    ) : checkedSessionStorage ? (
                        <Redirect
                            to={{
                                pathname: "/login"
                            }}
                        />
                    ) : (
                        <div>Loading...</div>
                    )
                }
            />
        );
    }

    private checkSessionStorage = async () => {
        const keyExisted = await isWalletExisted();
        if (keyExisted) {
            this.props.login();
        } else {
            this.setState({ checkedSessionStorage: true });
        }
    };
}

const mapStateToProps = (state: ReducerConfigure) => ({
    isAuthenticated: state.globalReducer.isAuthenticated
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    login: () => {
        dispatch(actions.login());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PrivateRoute);
