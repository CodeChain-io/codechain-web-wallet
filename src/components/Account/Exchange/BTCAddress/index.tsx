import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import ValidationInput from "../../../ValidationInput/ValidationInput";
import "./index.css";

export default class BTCAddress extends React.Component<any> {
    public render() {
        return (
            <div className="BTC-address">
                <h5 className="btc-address-title">Deposit address</h5>
                <div className="d-flex input-container">
                    <ValidationInput
                        className="btc-input"
                        value="0xabcdefghijk"
                        showValidation={false}
                        disable={true}
                        labelText="BTC Address"
                    />
                    <div className="copy-btn-container">
                        <FontAwesomeIcon icon="copy" />
                    </div>
                </div>
            </div>
        );
    }
}
