import * as React from "react";
import { match } from "react-router";

interface Props {
    match: match<{ address: string }>;
}

export default class AssetList extends React.Component<Props, any> {
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
        return <div>AssetList {address}</div>;
    }
}
