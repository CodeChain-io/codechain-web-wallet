import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import BTCAddress from "./BTCAddress";
import ExchangeHistory from "./ExchangeHistory";
import ExchangeRate from "./ExchangeRate";
import "./index.css";

interface Props {
    onClose: () => void;
}

export default class Exchange extends React.Component<Props> {
    public render() {
        const { onClose } = this.props;
        return (
            <div className="Exchange">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Exchange</h2>
                <div className="exchange-rate-container">
                    <ExchangeRate />
                </div>
                <div className="btc-address-container">
                    <BTCAddress />
                </div>
                <div className="exchange-history-container">
                    <ExchangeHistory />
                </div>
            </div>
        );
    }
}
