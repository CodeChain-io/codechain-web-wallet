import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { PlatformAccount } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import { changeQuarkToCCCString } from "../../utils/unit";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    account?: PlatformAccount | null;
}

interface DispatchProps {
    fetchAccountIfNeed: (address: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class Account extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }
    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            match: {
                params: { address: nextAddress }
            }
        } = props;
        if (nextAddress !== address) {
            this.getAccount();
        }
    }
    public componentDidMount() {
        this.getAccount();
    }
    public render() {
        const { account } = this.props;
        if (!account) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
                </div>
            );
        }
        return (
            <div>
                <Container>
                    <div className="mt-5">
                        <h4>My balance</h4>
                        <hr />
                        <span className="mr-1">
                            {changeQuarkToCCCString(account.balance)}
                        </span>
                        <span>CCC</span>
                    </div>
                </Container>
            </div>
        );
    }

    private getAccount = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchAccountIfNeed(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const account = state.walletReducer.accounts[address];
    return {
        account: account && account.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAccountIfNeed: (address: string) => {
        dispatch(actions.fetchAccountIfNeed(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Account);
