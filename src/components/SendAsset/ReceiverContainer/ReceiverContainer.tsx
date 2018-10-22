import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AssetTransferAddress } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { Label } from "reactstrap";
import "./ReceiverContainer.css";

interface State {
    addressInput: string;
    quantitiesInput: number;
    passphraseInput: string;
}

interface Props {
    totalQuantities: number;
    onSubmit: (
        receivers: { receiver: string; quantities: number }[],
        passphrase: string
    ) => void;
}

export default class ReceiverContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            addressInput: "",
            passphraseInput: "",
            quantitiesInput: 0
        };
    }
    public render() {
        const { quantitiesInput, addressInput, passphraseInput } = this.state;
        return (
            <div className="Receiver-container">
                <form onSubmit={this.handleSubmit}>
                    <div className="receiver-item">
                        <div className="form-group">
                            <Label for="asset-address">Receiver address</Label>
                            <input
                                type="text"
                                className="form-control"
                                id="asset-address"
                                placeholder="Enter Address"
                                value={addressInput}
                                onChange={this.handleChangeAddressInput}
                                required={true}
                            />
                        </div>
                        <div className="form-group">
                            <Label for="quantities">Quantities</Label>
                            <input
                                type="number"
                                className="form-control"
                                id="quantities"
                                placeholder="Enter quantities"
                                value={quantitiesInput}
                                onChange={this.handleChangeQuantitiesInput}
                                min={1}
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="add-btn d-flex align-items-center justify-content-center">
                            <FontAwesomeIcon icon="plus" />
                        </div>
                    </div>
                    <div className="passphrase-form mt-3">
                        <div className="form-group">
                            <Label for="passphrase">Passphrase</Label>
                            <input
                                type="password"
                                className="form-control"
                                id="passphrase"
                                placeholder="Enter passphrase"
                                value={passphraseInput}
                                onChange={this.handleChangePassphrase}
                                required={true}
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-primary">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { quantitiesInput, passphraseInput, addressInput } = this.state;
        const { totalQuantities } = this.props;
        if (quantitiesInput > totalQuantities) {
            alert("Not enough assets");
            return;
        }
        try {
            AssetTransferAddress.fromString(addressInput);
        } catch (e) {
            alert("Invalid address");
            return;
        }
        this.props.onSubmit(
            [
                {
                    receiver: addressInput,
                    quantities: quantitiesInput
                }
            ],
            passphraseInput
        );
    };

    private handleChangeAddressInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({ addressInput: event.target.value });
    };

    private handleChangePassphrase = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({ passphraseInput: event.target.value });
    };

    private handleChangeQuantitiesInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const quantities = parseInt(event.target.value, 10);
        this.setState({ quantitiesInput: quantities });
    };
}
