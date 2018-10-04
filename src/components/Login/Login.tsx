import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Dispatch } from "redux";
import { Actions } from "../../actions";

interface IDispatchProps {
    login: () => void;
}

interface IOwnProps {
    location: {
        state: any;
    };
}

interface IState {
    redirectToReferrer: boolean;
}

type IProps = IDispatchProps & IOwnProps;
class Login extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            redirectToReferrer: false
        };
    }
    public render() {
        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        const { redirectToReferrer } = this.state;
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        return (
            <div>
                Login
                <button onClick={this.onClickLogin}>Login</button>
            </div>
        );
    }
    private onClickLogin = () => {
        this.props.login();
        this.setState({ redirectToReferrer: true });
    };
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
    login: () => {
        dispatch(Actions.login());
    }
});
export default connect(
    () => ({}),
    mapDispatchToProps
)(Login);
