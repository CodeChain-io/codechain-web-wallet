import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import { fetchExchangeHistoryIfNeed } from "../../../redux/exchange/exchangeActions";
import ExchangeHistoryItem from "./ExchangeHistoryItem";
import * as Empty from "./img/cautiondisabled.svg";
import "./index.css";

interface OwnProps {
    address: string;
    selectedCurrency: "btc" | "eth";
}

interface StateProps {
    networkId: NetworkId;
    exchangeHistory?: {
        received: {
            hash: string;
            quantity: string;
            status: "success" | "pending" | "reverted";
            confirm: number;
        };
        sent: {
            hash?: string;
            quantity: string;
            status: "success" | "pending";
        };
    }[];
}

interface DispatchProps {
    fetchExchangeHistoryIfNeed: (
        address: string,
        currency: "btc" | "eth"
    ) => Promise<void>;
}

type Props = WithTranslation & OwnProps & StateProps & DispatchProps;
class ExchangeHistory extends React.Component<Props, any> {
    public componentDidMount() {
        this.props.fetchExchangeHistoryIfNeed(
            this.props.address,
            this.props.selectedCurrency
        );
    }
    public componentWillUpdate(nextProps: Props) {
        if (
            nextProps.address !== this.props.address ||
            nextProps.selectedCurrency !== this.props.selectedCurrency
        ) {
            this.props.fetchExchangeHistoryIfNeed(
                nextProps.address,
                nextProps.selectedCurrency
            );
        }
    }
    public render() {
        const { exchangeHistory, networkId, selectedCurrency } = this.props;
        return (
            <div className="Exchange-history">
                <h5 className="exchange-address-title">
                    <Trans i18nKey="charge:exchange_state.title" />{" "}
                    <span onClick={this.refresh} className="refresh-btn">
                        <FontAwesomeIcon icon="redo-alt" className="ml-1" />
                    </span>
                </h5>
                <div className="exchange-content-container">
                    {exchangeHistory ? (
                        exchangeHistory.length > 0 ? (
                            exchangeHistory.map((h, index) => (
                                <ExchangeHistoryItem
                                    selectedCurrency={selectedCurrency}
                                    key={index}
                                    history={h}
                                    networkId={networkId}
                                />
                            ))
                        ) : (
                            <div className="d-flex align-items-center justify-content-center">
                                <div>
                                    <div className="text-center mt-3">
                                        <img src={Empty} />
                                    </div>
                                    <div className="mt-3 empty">
                                        <Trans i18nKey="charge:exchange_state.no_record" />
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="exchange-history-loading">
                            <Trans i18nKey="loading" />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private refresh = () => {
        this.props.fetchExchangeHistoryIfNeed(
            this.props.address,
            this.props.selectedCurrency
        );
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { address, selectedCurrency } = ownProps;
    return {
        exchangeHistory:
            (state.exchangeReducer.exchangeHistory[selectedCurrency] || {})[
                address
            ] &&
            state.exchangeReducer.exchangeHistory[selectedCurrency][address]
                .data,
        networkId: state.globalReducer.networkId
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchExchangeHistoryIfNeed: (address: string, currency: "btc" | "eth") => {
        return dispatch(fetchExchangeHistoryIfNeed(address, currency));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(ExchangeHistory));
