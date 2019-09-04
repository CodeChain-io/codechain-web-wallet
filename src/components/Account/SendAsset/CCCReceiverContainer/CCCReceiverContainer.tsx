import BigNumber from "bignumber.js";
import { PlatformAddress, U64 } from "codechain-sdk/lib/core/classes";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import "./CCCReceiverContainer.css";
import CCCReceiverItem from "./CCCReceiverItem/CCCReceiverItem";

interface State {
    receiver: {
        address: string;
        quantity: string;
    };
    fee: string;
    isAddressValid?: boolean;
    addressError?: string;
    isAmountValid?: boolean;
    amountError?: string;
    isFeeValid?: boolean;
    feeError?: string;
}

interface OwnProps {
    address: string;
    totalAmount: U64;
    isSending: boolean;
    onSubmit: (receiver: { address: string; quantity: U64 }, fee: U64) => void;
}

type Props = WithTranslation & OwnProps;

const MinimumFee = 100;

class CCCReceiverContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            receiver: {
                address: "",
                quantity: ""
            },
            fee: `${MinimumFee}`,
            isFeeValid: undefined,
            feeError: undefined,
            isAddressValid: undefined,
            addressError: undefined,
            isAmountValid: undefined,
            amountError: undefined
        };
    }
    public render() {
        const {
            receiver,
            isAddressValid,
            addressError,
            isAmountValid,
            amountError,
            isFeeValid,
            feeError,
            fee
        } = this.state;
        const { isSending } = this.props;
        return (
            <div className="CCCReceiver-container">
                <form onSubmit={this.handleSubmit}>
                    <div className="receivers">
                        <CCCReceiverItem
                            fee={fee}
                            receiver={receiver}
                            onAddressChange={this.handleAddressChange}
                            onAmountChange={this.handleAmountChange}
                            onFeeChange={this.handleFeeChange}
                            remainingAmount={this.calculateRemainingCCCString()}
                            onAddressValidationCheck={
                                this.handleAddressValidationCheck
                            }
                            onAmountValidationCheck={
                                this.handleAmountValidationCheck
                            }
                            onFeeValidationCheck={this.handleFeeValidationCheck}
                            isAddressValid={isAddressValid}
                            isAmountValid={isAmountValid}
                            addressError={addressError}
                            amountError={amountError}
                            feeError={feeError}
                            isFeeValid={isFeeValid}
                        />
                    </div>
                    <div className="mt-5">
                        <button
                            disabled={isSending}
                            type="submit"
                            className="btn btn-primary square w-100 send-btn"
                        >
                            <Trans i18nKey="send:ccc.button" />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    private calculateRemainingCCCString = () => {
        const { totalAmount } = this.props;
        const { fee } = this.state;
        const remainingCCC = totalAmount.value.minus(fee);
        if (remainingCCC.gt(0)) {
            return remainingCCC.toString();
        } else {
            return "0";
        }
    };

    private handleAddressValidationCheck = () => {
        const { receiver } = this.state;
        const { t, address: myAddress } = this.props;
        const address = receiver.address;
        if (address === "") {
            this.setState({
                isAddressValid: false,
                addressError: t("send:ccc.error.address.required")
            });
            return false;
        }
        if (address === myAddress) {
            this.setState({
                isAddressValid: false,
                addressError: t("send:ccc.error.address.not_equal")
            });
            return false;
        }
        if (address) {
            try {
                PlatformAddress.fromString(address);
                this.setState({
                    isAddressValid: true,
                    addressError: undefined
                });
                return true;
            } catch (e) {
                // nothing
            }
        }
        this.setState({
            isAddressValid: false,
            addressError: t("send:ccc.error.address.invalid")
        });
        return false;
    };

    private handleAmountValidationCheck = () => {
        const { receiver, fee } = this.state;
        const { t, totalAmount } = this.props;
        const cccString = receiver.quantity;
        if (cccString === "") {
            this.setState({
                isAmountValid: false,
                amountError: t("send:ccc.error.amount.required")
            });
            return false;
        }
        console.log(cccString);
        const amountCCC = new BigNumber(cccString);
        if (amountCCC.isNaN()) {
            this.setState({
                isAmountValid: false,
                amountError: t("send:ccc.error.amount.invalid")
            });
            return false;
        }
        if (amountCCC.lt(1)) {
            this.setState({
                isAmountValid: false,
                amountError: t("send:ccc.error.amount.minimum")
            });
            return false;
        }
        const amountFee = new BigNumber(fee);
        if (amountCCC.plus(amountFee).gt(totalAmount.value)) {
            this.setState({
                isAmountValid: false,
                amountError: t("send:ccc.error.amount.not_enough")
            });
            return false;
        }
        this.setState({
            isAmountValid: true,
            amountError: undefined
        });
        return true;
    };

    private handleFeeValidationCheck = () => {
        const { receiver, fee } = this.state;
        const { t, totalAmount } = this.props;
        const feeString = fee;
        if (feeString === "") {
            this.setState({
                isFeeValid: false,
                feeError: t("send:ccc.error.fee.required")
            });
            return false;
        }
        const amountFee = new BigNumber(feeString);
        if (amountFee.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:ccc.error.fee.invalid")
            });
            return false;
        }
        if (amountFee.lt(MinimumFee)) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:ccc.error.fee.minimum", {
                    minimum: MinimumFee
                })
            });
            return false;
        }
        const amountCCC = new BigNumber(
            receiver.quantity === "" ? "0" : receiver.quantity
        );
        if (amountCCC.plus(amountFee).gt(totalAmount.value)) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:ccc.error.fee.not_enough")
            });
            return false;
        }
        this.setState({
            isFeeValid: true,
            feeError: undefined
        });
        return true;
    };

    private handleAddressChange = (address: string) => {
        const { receiver } = this.state;
        this.setState({
            receiver: {
                address,
                quantity: receiver.quantity
            },
            addressError: undefined,
            isAddressValid: undefined
        });
    };

    private handleAmountChange = (quantity: string) => {
        const { receiver } = this.state;
        this.setState({
            receiver: {
                address: receiver.address,
                quantity
            },
            amountError: undefined,
            isAmountValid: undefined
        });
    };

    private handleFeeChange = (amount: string) => {
        this.setState({
            fee: amount,
            feeError: undefined,
            isFeeValid: undefined
        });
    };

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { receiver, fee } = this.state;

        if (!this.handleAmountValidationCheck()) {
            return;
        }

        if (!this.handleAddressValidationCheck()) {
            return;
        }

        if (!this.handleFeeValidationCheck()) {
            return;
        }

        const amountCCC = new BigNumber(receiver.quantity);
        const amountFee = new BigNumber(fee);
        this.props.onSubmit(
            {
                address: receiver.address,
                quantity: new U64(amountCCC)
            },
            new U64(amountFee)
        );
    };
}

export default withTranslation()(CCCReceiverContainer);
