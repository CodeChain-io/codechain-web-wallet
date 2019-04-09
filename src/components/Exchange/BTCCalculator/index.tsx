import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import * as React from "react";
import ValidationInput from "../../ValidationInput/ValidationInput";
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
                        decimalScale={8}
                        type="number"
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
                        decimalScale={0}
                        placeholder={`${
                            btcToCCCRate
                                ? btcToCCCRate.toLocaleString()
                                : "Loading"
                        } CCC`}
                        type="number"
                        disable={!btcToCCCRate}
                    />
                </div>
            </div>
        );
    }
    private handleBTCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { btcToCCCRate } = this.props;
        const btc = event.target.value;
        const ccc = new BigNumber(btc).multipliedBy(btcToCCCRate!);
        this.setState({ btc, ccc: ccc.isNaN() ? "" : ccc.toString(10) });
    };
    private handleCCCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { btcToCCCRate } = this.props;
        const ccc = event.target.value;
        const btc = new BigNumber(ccc).div(btcToCCCRate!);
        this.setState({ btc: btc.isNaN() ? "" : btc.toString(10), ccc });
    };
}
