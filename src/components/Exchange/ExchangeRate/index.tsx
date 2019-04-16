import BigNumber from "bignumber.js";
import * as React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../../redux";
import { fetchExchangeRateIfNeed } from "../../../redux/exchange/exchangeActions";
import ExchangeCalculator from "../ExchangeCalculator";
import "./index.css";

interface State {
    showCalculator: boolean;
}

interface StateProps {
    exchangeRate?: number;
}

interface DispatchProps {
    fetchExchangeRateIfNeed: (currency: "btc" | "eth") => Promise<void>;
}

interface OwnProps {
    selectedCurrency: "btc" | "eth";
}

type Props = WithTranslation & StateProps & DispatchProps & OwnProps;
class ExchangeRate extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showCalculator: false
        };
    }
    public componentDidMount() {
        const { selectedCurrency } = this.props;
        this.props.fetchExchangeRateIfNeed(selectedCurrency);
    }
    public componentWillUpdate(nextProps: Props) {
        if (nextProps.selectedCurrency !== this.props.selectedCurrency) {
            this.props.fetchExchangeRateIfNeed(nextProps.selectedCurrency);
        }
    }
    public render() {
        const { showCalculator } = this.state;
        const { exchangeRate, selectedCurrency } = this.props;
        return (
            <div className="Exchange-rate">
                <div className="exchange-rate-item-container text-right">
                    <div className="exchange-rate-item">
                        <span>1 USD</span>
                        <span> = </span>
                        <span>1,000 CCC</span>
                        <span> = </span>
                        <span>
                            {exchangeRate
                                ? new BigNumber(1000)
                                      .div(exchangeRate)
                                      .toFixed(8)
                                : "Loading"}{" "}
                            {this.getLabel(selectedCurrency)}
                        </span>
                    </div>
                    <div>
                        <span
                            className="simulator-label"
                            onClick={this.toggleCalculator}
                        >
                            <Trans i18nKey="charge:exchange_rate.button" />
                        </span>
                    </div>
                </div>
                {showCalculator && (
                    <div className="BTC-calculator-container">
                        <ExchangeCalculator
                            exchangeRate={exchangeRate}
                            currency={selectedCurrency}
                        />
                    </div>
                )}
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
    private toggleCalculator = () => {
        this.setState({
            showCalculator: !this.state.showCalculator
        });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    return {
        exchangeRate:
            state.exchangeReducer.exchangeRate[ownProps.selectedCurrency] &&
            state.exchangeReducer.exchangeRate[ownProps.selectedCurrency].data
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchExchangeRateIfNeed: (currency: "btc" | "eth") => {
        return dispatch(fetchExchangeRateIfNeed(currency));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(ExchangeRate));
