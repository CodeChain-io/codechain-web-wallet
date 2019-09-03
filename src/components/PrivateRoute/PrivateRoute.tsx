import React from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { isKeystoreExisted } from "../../model/keystore";
import { ReducerConfigure } from "../../redux";

interface State {
    isKeyExisted?: boolean | null;
}

interface OwnProps {
    component: any;
    exact?: boolean;
    path: string;
}

interface StateProps {
    passphrase?: string | null;
}

type Props = StateProps & OwnProps;
class PrivateRoute extends React.Component<Props, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            isKeyExisted: undefined
        };
    }

    public componentDidUpdate() {
        const { passphrase } = this.props;
        const { isKeyExisted } = this.state;
        if (!passphrase && isKeyExisted == null) {
            this.checkLogin();
        }
    }

    public componentDidMount() {
        const { passphrase } = this.props;
        const { isKeyExisted } = this.state;
        if (!passphrase && isKeyExisted == null) {
            this.checkLogin();
        }
    }

    public render() {
        const { passphrase, component: Component, ...rest } = this.props;
        const { isKeyExisted } = this.state;
        return (
            <Route
                {...rest}
                // tslint:disable-next-line:jsx-no-lambda
                render={props =>
                    passphrase ? (
                        <Component {...props} />
                    ) : isKeyExisted == null ? (
                        <div>Loading...</div>
                    ) : isKeyExisted ? (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: { from: props.location }
                            }}
                        />
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/selectKeyfile"
                            }}
                        />
                    )
                }
            />
        );
    }

    private checkLogin = async () => {
        const keyExisted = await isKeystoreExisted();
        if (keyExisted) {
            this.setState({ isKeyExisted: true });
        } else {
            this.setState({ isKeyExisted: false });
        }
    };
}

const mapStateToProps = (state: ReducerConfigure) => ({
    passphrase: state.globalReducer.passphrase
});

export default connect(mapStateToProps)(PrivateRoute);
