import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import ValidationInput from "../../../ValidationInput/ValidationInput";
import "./index.css";
interface Props {
    btcToCCCRate?: number;
}
interface State {
    btc: string;
    ccc: string;
}
export default class BTCCalculator extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { btc: "", ccc: "" };
    }
    public render() {
        const { btc, ccc } = this.state;
        const { btcToCCCRate } = this.props;
        return (
            <div className="BTC-calculator">
                <div className="input-container">
                    <ValidationInput
                        value={btc}
                        onChange={this.handleBTCChange}
                        showValidation={false}
                        labelText={"BTC"}
                        placeholder={"1 BTC"}
                        disable={!btcToCCCRate}
                    />
                    <FontAwesomeIcon
                        className="exchange-icon"
                        icon="arrow-right"
                    />
                    <ValidationInput
                        value={ccc}
                        onChange={this.handleCCCChange}
                        showValidation={false}
                        labelText={"CCC"}
                        placeholder={`${
                            btcToCCCRate
                                ? btcToCCCRate.toLocaleString()
                                : "Loading"
                        } CCC`}
                        disable={!btcToCCCRate}
                    />
                </div>
            </div>
        );
    }
    private handleBTCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { btcToCCCRate } = this.props;
        const btc = event.target.value;
        const ccc = btcToCCCRate! * Number(btc);
        this.setState({ btc, ccc: ccc.toString() });
    };
    private handleCCCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { btcToCCCRate } = this.props;
        const ccc = event.target.value;
        const btc = Number(ccc) / btcToCCCRate!;
        this.setState({ btc: btc.toString(), ccc });
    };
}
