import BigNumber from "bignumber.js";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../../redux";
import { fetchBTCToCCCRateIfNeed } from "../../../redux/exchange/exchangeActions";
import BTCCalculator from "../BTCCalculator";
import "./index.css";

interface State {
    showCalculator: boolean;
}

interface StateProps {
    btcToCCCRate?: number;
}

interface DispatchProps {
    fetchBTCToCCCRateIfNeed: () => Promise<void>;
}

type Props = StateProps & DispatchProps;
class ExchangeRate extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showCalculator: false
        };
    }
    public componentDidMount() {
        this.props.fetchBTCToCCCRateIfNeed();
    }
    public render() {
        const { showCalculator } = this.state;
        const { btcToCCCRate } = this.props;
        return (
            <div className="Exchange-rate">
                <div className="exchange-rate-item-container text-right">
                    <div className="exchange-rate-item">
                        <span>1 USD</span>
                        <span> = </span>
                        <span>1,000 CCC</span>
                        <span> = </span>
                        <span>
                            {btcToCCCRate
                                ? new BigNumber(1000)
                                      .div(btcToCCCRate)
                                      .toFixed(8)
                                : "Loading"}{" "}
                            BTC
                        </span>
                    </div>
                    <div>
                        <span
                            className="simulator-label"
                            onClick={this.toggleCalculator}
                        >
                            CCC simulator
                        </span>
                    </div>
                </div>
                {showCalculator && (
                    <div className="BTC-calculator-container">
                        <BTCCalculator btcToCCCRate={btcToCCCRate} />
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

const mapStateToProps = (state: ReducerConfigure) => {
    return {
        btcToCCCRate:
            state.exchangeReducer.btcToCCCRate &&
            state.exchangeReducer.btcToCCCRate.data
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchBTCToCCCRateIfNeed: () => {
        return dispatch(fetchBTCToCCCRateIfNeed());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExchangeRate);
