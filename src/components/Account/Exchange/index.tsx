import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import BTCAddress from "./BTCAddress";
import ExchangeHistory from "./ExchangeHistory";
import ExchangeRate from "./ExchangeRate";
import "./index.css";

interface Props {
    onClose: () => void;
    address: string;
}

export default class Exchange extends React.Component<Props> {
    public render() {
        const { onClose, address } = this.props;
        return (
            <div className="Exchange">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Buy CCC</h2>
                <div className="description-container">
                    <span className="description">
                        You can buy CCC by transferring BTC to the address
                        below.
                    </span>
                </div>
                <div className="btc-address-container">
                    <BTCAddress address={address} />
                </div>
                <div className="exchange-rate-container">
                    <ExchangeRate />
                </div>
                <div className="exchange-history-container">
                    <ExchangeHistory address={address} />
                </div>
            </div>
        );
    }
}
