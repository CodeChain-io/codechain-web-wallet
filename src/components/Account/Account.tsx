import * as React from "react";
import { match } from "react-router";

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
        return <div>Account {address}</div>;
    }
}
