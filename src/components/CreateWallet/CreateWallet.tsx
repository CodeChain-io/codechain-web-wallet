import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Container } from "reactstrap";

import * as _ from "lodash";
import "./CreateWallet.css";
import InputPassphrase from "./InputPassphrase/InputPassphrase";

export default class CreateWallet extends React.Component<any, any> {
    public render() {
        return (
            <Container className="Create-wallet">
                <div className="close-btn">
                    <FontAwesomeIcon icon="times" className="icon" />
                </div>
                <div className="create-wallet-form-group">
                    <InputPassphrase />
                </div>
                <div className="dot-indicator-container">
                    {_.map(_.range(3), index => {
                        return (
                            <FontAwesomeIcon
                                icon="circle"
                                className="indicator-icon active"
                            />
                        );
                    })}
                </div>
            </Container>
        );
    }
}
