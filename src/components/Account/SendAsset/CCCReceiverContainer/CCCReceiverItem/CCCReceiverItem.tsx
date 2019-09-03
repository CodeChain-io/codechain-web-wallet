import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import ValidationInput from "../../../../ValidationInput/ValidationInput";
import "./CCCReceiverItem.css";

interface OwnProps {
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

type Props = WithTranslation & OwnProps;

class CCCReceiverItem extends React.Component<Props> {
    public render() {
        const {
            t,
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
                    labelText={t("send:ccc.receiver.label")}
                    placeholder={t("send:ccc.receiver.placeholder")}
                    showValidation={true}
                    isValid={isAddressValid}
                    onBlur={this.handleBlurAddressInput}
                    error={addressError}
                />
                <div className="d-flex align-items-end">
                    <ValidationInput
                        value={receiver.quantity}
                        onChange={this.handleChangedAmountInput}
                        labelText={t("send:ccc.amount.label")}
                        placeholder={t("send:ccc.amount.placeholder")}
                        type="number"
                        className="flex-grow-1 flex-shrink-1"
                        showValidation={true}
                        isValid={isAmountValid}
                        onBlur={this.handleBlurAmountInput}
                        error={amountError}
                        decimalScale={0}
                    />
                    <button
                        type="button"
                        className="btn btn-primary max-btn"
                        onClick={this.handleMaxValueClick}
                    >
                        <Trans i18nKey="main:max" />
                    </button>
                </div>
                <div>
                    <ValidationInput
                        value={fee}
                        onChange={this.handleChangeFeeInput}
                        labelText={t("send:ccc.fee.label")}
                        placeholder={`100 (CCC)`}
                        type="number"
                        className="flex-grow-1 flex-shrink-1"
                        showValidation={true}
                        isValid={isFeeValid}
                        tooltip="send:ccc.fee.tooltip"
                        onBlur={this.handleBlurFeeInput}
                        error={feeError}
                        decimalScale={0}
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

export default withTranslation()(CCCReceiverItem);
