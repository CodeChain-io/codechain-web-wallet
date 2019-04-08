import * as React from "react";
import ValidationInput from "../../../../ValidationInput/ValidationInput";
import "./CCCReceiverItem.css";

interface Props {
    receiver: {
        address: string;
        quantity: string;
    };
    remainingAmount: string;
    fee: string;
    onAddressChange: (address: string) => void;
    onAmountChange: (quantity: string) => void;
    onAddressValidationCheck: () => void;
    onAmountValidationCheck: () => void;
    onFeeValidationCheck: () => void;
    onFeeChange: (quantity: string) => void;
    isAddressValid?: boolean;
    isAmountValid?: boolean;
    addressError?: string;
    amountError?: string;
    feeError?: string;
    isFeeValid?: boolean;
}

export default class CCCReceiverItem extends React.Component<Props, any> {
    public render() {
        const {
            receiver,
            isAddressValid,
            isAmountValid,
            addressError,
            amountError,
            fee,
            isFeeValid,
            feeError
        } = this.props;
        return (
            <div className="CCCReceiver-item animated fadeIn">
                <ValidationInput
                    value={receiver.address}
                    onChange={this.handleChangeAddressInput}
                    labelText="RECEIVER ADDRESS"
                    placeholder="receiver address"
                    showValidation={true}
                    isValid={isAddressValid}
                    onBlur={this.handleBlurAddressInput}
                    error={addressError}
                />
                <div className="d-flex align-items-end">
                    <ValidationInput
                        value={receiver.quantity}
                        onChange={this.handleChangedAmountInput}
                        labelText="AMOUNT"
                        placeholder="amount"
                        type="text"
                        className="flex-grow-1 flex-shrink-1"
                        showValidation={true}
                        isValid={isAmountValid}
                        onBlur={this.handleBlurAmountInput}
                        error={amountError}
                    />
                    <button
                        type="button"
                        className="btn btn-primary max-btn"
                        onClick={this.handleMaxValueClick}
                    >
                        max
                    </button>
                </div>
                <div>
                    <ValidationInput
                        value={fee}
                        onChange={this.handleChangeFeeInput}
                        labelText="FEE"
                        placeholder={`100 (CCC)`}
                        type="text"
                        className="flex-grow-1 flex-shrink-1"
                        showValidation={true}
                        isValid={isFeeValid}
                        onBlur={this.handleBlurFeeInput}
                        error={feeError}
                    />
                </div>
            </div>
        );
    }

    private handleBlurAddressInput = () => {
        const { onAddressValidationCheck } = this.props;
        onAddressValidationCheck();
    };

    private handleBlurAmountInput = () => {
        const { onAmountValidationCheck } = this.props;
        onAmountValidationCheck();
    };

    private handleBlurFeeInput = () => {
        const { onFeeValidationCheck } = this.props;
        onFeeValidationCheck();
    };

    private handleMaxValueClick = () => {
        const { onAmountChange, remainingAmount } = this.props;
        onAmountChange(remainingAmount);
    };

    private handleChangeAddressInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { onAddressChange } = this.props;
        onAddressChange(event.target.value);
    };

    private handleChangedAmountInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { onAmountChange } = this.props;
        onAmountChange(event.target.value);
    };

    private handleChangeFeeInput = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { onFeeChange } = this.props;
        onFeeChange(event.target.value);
    };
}
