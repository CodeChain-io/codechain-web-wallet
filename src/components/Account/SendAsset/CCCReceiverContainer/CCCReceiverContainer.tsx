import BigNumber from "bignumber.js";
import { PlatformAddress, U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { changeQuarkToCCCString } from "../../../../utils/unit";
import "./CCCReceiverContainer.css";
import CCCReceiverItem from "./CCCReceiverItem/CCCReceiverItem";

interface State {
    receiver: {
        address: string;
        amount: string;
    };
    fee: string;
    isAddressValid?: boolean;
    addressError?: string;
    isAmountValid?: boolean;
    amountError?: string;
    isFeeValid?: boolean;
    feeError?: string;
}

interface Props {
    address: string;
    totalAmount: U256;
    onSubmit: (receiver: { address: string; amount: U256 }, fee: U256) => void;
}

export default class CCCReceiverContainer extends React.Component<
    Props,
    State
> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            receiver: {
                address: "",
                amount: ""
            },
            fee: "0.01",
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
                            type="submit"
                            className="btn btn-primary square w-100 send-btn"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    private calculateRemainingCCCString = () => {
        const { totalAmount } = this.props;
        const { fee } = this.state;
        const feeQuark = new BigNumber(fee).multipliedBy(Math.pow(10, 9));
        const remainingQuark = totalAmount.value.minus(feeQuark);
        try {
            return changeQuarkToCCCString(new U256(remainingQuark));
        } catch (e) {
            console.log(e);
            return "0";
        }
    };

    private handleAddressValidationCheck = () => {
        const { receiver } = this.state;
        const { address: myAddress } = this.props;
        const address = receiver.address;
        if (address === myAddress) {
            this.setState({
                isAddressValid: false,
                addressError: "can't send CCC to sender's address"
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
            addressError: "invalid address"
        });
        return false;
    };

    private handleAmountValidationCheck = () => {
        const { receiver, fee } = this.state;
        const { totalAmount } = this.props;
        const amountQuark = new BigNumber(receiver.amount).multipliedBy(
            Math.pow(10, 9)
        );
        if (amountQuark.isNaN()) {
            this.setState({
                isAmountValid: false,
                amountError: "invalid number"
            });
            return false;
        }
        if (amountQuark.lt(1)) {
            this.setState({
                isAmountValid: false,
                amountError: "minimum value is 0.000000001"
            });
            return false;
        }
        const feeQuark = new BigNumber(fee).multipliedBy(Math.pow(10, 9));
        if (amountQuark.plus(feeQuark).gt(totalAmount.value)) {
            this.setState({
                isAmountValid: false,
                amountError: "not enough CCC"
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
        const { totalAmount } = this.props;
        const feeQuark = new BigNumber(fee).multipliedBy(Math.pow(10, 9));
        if (feeQuark.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: "invalid number"
            });
            return false;
        }
        if (feeQuark.lt(1)) {
            this.setState({
                isFeeValid: false,
                feeError: "minimum value is 0.000000001"
            });
            return false;
        }
        const amountQuark = new BigNumber(receiver.amount).multipliedBy(
            Math.pow(10, 9)
        );
        if (amountQuark.plus(feeQuark).gt(totalAmount.value)) {
            this.setState({
                isFeeValid: false,
                feeError: "not enough CCC"
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
                amount: receiver.amount
            },
            addressError: undefined,
            isAddressValid: undefined
        });
    };

    private handleAmountChange = (amount: string) => {
        const { receiver } = this.state;
        this.setState({
            receiver: {
                address: receiver.address,
                amount
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

        const amountQuark = new BigNumber(receiver.amount).multipliedBy(
            Math.pow(10, 9)
        );
        const feeQuark = new BigNumber(fee).multipliedBy(Math.pow(10, 9));
        this.props.onSubmit(
            {
                address: receiver.address,
                amount: new U256(amountQuark)
            },
            new U256(feeQuark)
        );
    };
}
