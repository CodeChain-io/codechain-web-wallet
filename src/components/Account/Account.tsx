import * as React from "react";
import { match } from "react-router";
import { createWallet, saveWallet } from "../../model/wallet";

interface Props {
    match: match<{ address: string }>;
}

export default class Account extends React.Component<any, any> {
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
            // Reset
        }
    }
    public render() {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        return (
            <div>
                Account {address} <button onClick={this.save}>save</button>
            </div>
        );
    }
    private save = async () => {
        await createWallet();
        await saveWallet("codechain-key");
    };
}
