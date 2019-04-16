import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import * as React from "react";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./index.css";
interface Props {
    exchangeRate?: number;
    currency: "btc" | "eth";
}
interface State {
    btc: string;
    ccc: string;
}
export default class ExchangeCalculator extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { btc: "", ccc: "" };
    }
    public render() {
        const { btc, ccc } = this.state;
        const { exchangeRate, currency } = this.props;
        return (
            <div className="BTC-calculator">
                <div className="input-container">
                    <ValidationInput
                        value={btc}
                        onChange={this.handleBTCChange}
                        showValidation={false}
                        labelText={`${this.getLabel(currency)}`}
                        placeholder={`1 ${this.getLabel(currency)}`}
                        disable={!exchangeRate}
                        decimalScale={this.getDecimalScale(currency)}
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
                            exchangeRate
                                ? exchangeRate.toLocaleString()
                                : "Loading"
                        } CCC`}
                        type="number"
                        disable={!exchangeRate}
                    />
                </div>
            </div>
        );
    }
    private getLabel = (currency: "btc" | "eth") => {
        if (currency === "btc") {
            return "BTC";
        } else if (currency === "eth") {
            return "ETH";
        }
        return "";
    };
    private getDecimalScale = (currency: "btc" | "eth") => {
        if (currency === "btc") {
            return 8;
        } else if (currency === "eth") {
            return 18;
        }
        return 0;
    };
    private handleBTCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { exchangeRate } = this.props;
        const btc = event.target.value;
        const ccc = new BigNumber(btc).multipliedBy(exchangeRate!);
        this.setState({ btc, ccc: ccc.isNaN() ? "" : ccc.toString(10) });
    };
    private handleCCCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { exchangeRate } = this.props;
        const ccc = event.target.value;
        const btc = new BigNumber(ccc).div(exchangeRate!);
        this.setState({ btc: btc.isNaN() ? "" : btc.toString(10), ccc });
    };
}
