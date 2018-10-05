import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { IRootState } from "../../reducers";

interface IStateProps {
    isAuthenticated: boolean;
}
interface IDispatchProps {
    logout: () => void;
}

type IProps = IDispatchProps & IStateProps;
class Header extends React.Component<IProps, any> {
    public render() {
        const { isAuthenticated } = this.props;
        return (
            <div>
                Header{" "}
                {isAuthenticated && (
                    <button onClick={this.handleLogout}>Logout</button>
                )}
            </div>
        );
    }
    private handleLogout = () => {
        this.props.logout();
    };
}
const mapStateToProps = (state: IRootState) => ({
    isAuthenticated: state.isAuthenticated
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    logout: () => {
        dispatch(Actions.logout());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
