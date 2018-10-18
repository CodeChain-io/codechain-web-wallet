import * as React from "react";
import { match } from "react-router";
import { Container } from "reactstrap";

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
        return (
            <div>
                <Container>
                    <div className="mt-5">CCC</div>
                </Container>
            </div>
        );
    }
}
