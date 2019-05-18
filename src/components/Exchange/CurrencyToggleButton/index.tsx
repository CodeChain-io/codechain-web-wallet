import * as React from "react";
import { Button, ButtonGroup } from "reactstrap";
import "./index.css";

interface Props {
    selectedCurrency: "eth";
    onChangedCurrency: (currency: "eth") => void;
}

export default class CurrencyToggleButton extends React.Component<Props, any> {
    public render() {
        return (
            <ButtonGroup className="Currency-toggle-button">
                <Button
                    color="primary"
                    // tslint:disable-next-line:jsx-no-lambda
                    onClick={() => this.props.onChangedCurrency("eth")}
                    active={this.props.selectedCurrency === "eth"}
                >
                    ETH
                </Button>
            </ButtonGroup>
        );
    }
}
