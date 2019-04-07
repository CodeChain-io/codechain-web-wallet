import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import ValidationInput from "../../../ValidationInput/ValidationInput";
import "./index.css";

interface State {
    btc: string;
    ccc: string;
}
export default class BTCCalculator extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = { btc: "", ccc: "" };
    }
    public render() {
        const { btc, ccc } = this.state;
        return (
            <div className="BTC-calculator">
                <div className="input-container">
                    <ValidationInput
                        value={btc}
                        onChange={this.handleBTCChange}
                        showValidation={false}
                        labelText={"BTC"}
                        placeholder={"1 BTC"}
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
                        placeholder={"1000 CCC"}
                    />
                </div>
            </div>
        );
    }
    private handleBTCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ btc: event.target.value });
    };
    private handleCCCChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ ccc: event.target.value });
    };
}
