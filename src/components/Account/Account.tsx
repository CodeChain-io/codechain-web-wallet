import * as React from "react";
import { match } from "react-router";
import { Container } from "reactstrap";
import { PlatformAccount } from "../../model/address";
import { getPlatformAccount } from "../../networks/Api";
import { changeQuarkToCCC } from "../../utils/unit";

interface Props {
    match: match<{ address: string }>;
}

interface State {
    account?: PlatformAccount;
}

export default class Account extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            account: undefined
        };
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
            this.setState({ account: undefined });
            this.getAccount();
        }
    }
    public componentDidMount() {
        this.getAccount();
    }
    public render() {
        const { account } = this.state;
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
                            {changeQuarkToCCC(account.balance)}
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
        try {
            const account = await getPlatformAccount(address);
            console.log(account);
            this.setState({ account });
        } catch (e) {
            console.log(e);
        }
    };
}
