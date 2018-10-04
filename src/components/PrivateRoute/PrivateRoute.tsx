import * as React from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { IRootState } from "../../reducers";

class PrivateRoute extends React.Component<any, {}> {
    public render() {
        const { isAuthenticated, component: Component, ...rest } = this.props;
        return (
            <Route
                {...rest}
                // tslint:disable-next-line:jsx-no-lambda
                render={props =>
                    isAuthenticated ? (
                        <Component {...props} />
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: { from: props.location }
                            }}
                        />
                    )
                }
            />
        );
    }
}

const mapStateToProps = (state: IRootState) => ({
    isAuthenticated: state.isAuthenticated
});
export default connect(mapStateToProps)(PrivateRoute);
