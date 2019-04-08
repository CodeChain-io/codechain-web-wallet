import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import ValidationInput from "../../../../ValidationInput/ValidationInput";

import { U64 } from "codechain-sdk/lib/core/classes";
import "./ReceiverItem.css";

interface Props {
    receiver: {
        address: string;
        quantity: string;
    };
    remainingAsset: U64;
    onAddressChange: (index: number, address: string) => void;
    onQuantityChange: (index: number, quantity: string) => void;
    onAddressValidationCheck: (index: number) => void;
    onQuantityValidationCheck: (index: number) => void;
    isAddressValid?: boolean;
    isQuantityValid?: boolean;
    addressError?: string;
    quantityError?: string;
    index: number;
    onRemove: (index: number) => void;
    hideCancel?: boolean;
}

export default class ReceiverItem extends React.Component<Props, any> {
    public render() {
        const {
            receiver,
            index,
            isAddressValid,
            isQuantityValid,
            addressError,
            quantityError,
            hideCancel
        } = this.props;
        return (
            <div className="Receiver-item animated fadeIn">
                <div className="d-flex align-items-end">
                    {!hideCancel && (
                        <span className="mr-auto receiver-item-index">
                            {index + 1}
                        </span>
                    )}
                    {!hideCancel && (
                        <span
                            className="receiver-item-cancel"
                            onClick={this.handleRemove}
                        >
                            remove <FontAwesomeIcon icon="times" />
                        </span>
                    )}
                </div>
                <ValidationInput
                    value={receiver.address}
                    onChange={this.handleChangeAddressInput}
                    labelText="RECIPIENT ADDRESS"
                    placeholder="recipient address"
                    showValidation={true}
                    isValid={isAddressValid}
                    onBlur={this.handleBlurAddressInput}
                    error={addressError}
                />
                <div className="d-flex align-items-end">
                    <ValidationInput
                        value={receiver.quantity}
                        onChange={this.handleChangeQuantitiesInput}
                        labelText="QUANTITY"
                        placeholder="quantity"
                        type="number"
                        className="flex-grow-1 flex-shrink-1"
                        showValidation={true}
                        isValid={isQuantityValid}
                        onBlur={this.handleBlurQuantityInput}
                        error={quantityError}
                    />
                    <button
                        type="button"
                        className="btn btn-primary max-btn"
                        onClick={this.handleMaxValueClick}
                    >
                        max
                    </button>
                </div>
            </div>
        );
    }

    private handleRemove = () => {
        const { index, onRemove } = this.props;
        onRemove(index);
    };

    private handleBlurAddressInput = () => {
        const { index, onAddressValidationCheck } = this.props;
        onAddressValidationCheck(index);
    };

    private handleBlurQuantityInput = () => {
        const { index, onQuantityValidationCheck } = this.props;
        onQuantityValidationCheck(index);
    };

    private handleMaxValueClick = () => {
        const { index, onQuantityChange, remainingAsset } = this.props;
        onQuantityChange(index, remainingAsset.toString(10));
    };

    private handleChangeAddressInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { index, onAddressChange } = this.props;
        onAddressChange(index, event.target.value);
    };

    private handleChangeQuantitiesInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { index, onQuantityChange } = this.props;
        onQuantityChange(index, event.target.value);
    };
}
