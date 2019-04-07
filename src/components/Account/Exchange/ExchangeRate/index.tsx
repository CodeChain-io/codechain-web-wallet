import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import BTCCalculator from "../BTCCalculator";
import "./index.css";

interface State {
    showCalculator: boolean;
}

export default class ExchangeRate extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            showCalculator: false
        };
    }
    public render() {
        const { showCalculator } = this.state;
        return (
            <div className="Exchange-rate">
                <div className="exchange-rate-item-container text-right">
                    <div className="exchange-rate-item">
                        <span className="mr-3">1 BTC</span>
                        <FontAwesomeIcon
                            className="exchange-icon"
                            icon="arrow-right"
                        />
                        <span className="ml-3">1000 CCC</span>
                    </div>
                    <div>
                        <span
                            className="simulator-label"
                            onClick={this.toggleCalculator}
                        >
                            CCC simulators
                        </span>
                    </div>
                </div>
                {showCalculator && (
                    <div className="BTC-calculator-container">
                        <BTCCalculator />
                    </div>
                )}
            </div>
        );
    }
    private toggleCalculator = () => {
        this.setState({
            showCalculator: !this.state.showCalculator
        });
    };
}
