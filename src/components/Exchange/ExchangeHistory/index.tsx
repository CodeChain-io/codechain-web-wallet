import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
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
    fetchExchangeHistoryIfNeed: (address: string) => Promise<void>;
}

type Props = OwnProps & StateProps & DispatchProps;
class ExchangeHistory extends React.Component<Props, any> {
    public componentDidMount() {
        this.props.fetchExchangeHistoryIfNeed(this.props.address);
    }
    public componentWillUpdate(nextProps: Props) {
        if (nextProps.address !== this.props.address) {
            this.props.fetchExchangeHistoryIfNeed(nextProps.address);
        }
    }
    public render() {
        const { exchangeHistory, networkId } = this.props;
        return (
            <div className="Exchange-history">
                <h5 className="exchange-address-title">
                    Status{" "}
                    <span onClick={this.refresh} className="refresh-btn">
                        <FontAwesomeIcon icon="redo-alt" className="ml-1" />
                    </span>
                </h5>
                <div className="exchange-content-container">
                    {exchangeHistory ? (
                        exchangeHistory.length > 0 ? (
                            exchangeHistory.map((h, index) => (
                                <ExchangeHistoryItem
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
                                        There is no record
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="exchange-history-loading">
                            loading...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private refresh = () => {
        this.props.fetchExchangeHistoryIfNeed(this.props.address);
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { address } = ownProps;
    return {
        exchangeHistory:
            state.exchangeReducer.exchangeHistory[address] &&
            state.exchangeReducer.exchangeHistory[address].data,
        networkId: state.globalReducer.networkId
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchExchangeHistoryIfNeed: (address: string) => {
        return dispatch(fetchExchangeHistoryIfNeed(address));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExchangeHistory);
