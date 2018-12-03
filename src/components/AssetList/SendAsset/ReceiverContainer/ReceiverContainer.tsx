import { AssetTransferAddress } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import "./ReceiverContainer.css";
import ReceiverItem from "./ReceiverItem/ReceiverItem";

interface State {
    receivers: {
        address: string;
        quantity: number;
    }[];
    addressValidations: {
        [index: number]:
            | {
                  isAddressValid?: boolean;
                  addressError?: string;
              }
            | undefined;
    };
    quantityValidations: {
        [index: number]:
            | {
                  isQuantityValid?: boolean;
                  quantityError?: string;
              }
            | undefined;
    };
}

interface Props {
    totalQuantity: number;
    onSubmit: (receivers: { address: string; quantity: number }[]) => void;
}

export default class ReceiverContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            receivers: [
                {
                    address: "",
                    quantity: 0
                }
            ],
            addressValidations: {},
            quantityValidations: {}
        };
    }
    public render() {
        const {
            receivers,
            addressValidations,
            quantityValidations
        } = this.state;
        return (
            <div className="Receiver-container">
                <form onSubmit={this.handleSubmit}>
                    <div className="receivers">
                        {_.map(receivers, (receiver, index) => (
                            <ReceiverItem
                                key={`receiver-${index}`}
                                receiver={receiver}
                                onAddressChange={this.handleAddressChange}
                                onQuantityChange={this.handleQuantityChange}
                                remainingAsset={this.calculateRemainingAsset(
                                    index
                                )}
                                index={index}
                                onAddressValidationCheck={
                                    this.handleAddressValidationCheck
                                }
                                onQuantityValidationCheck={
                                    this.handleQuantityValidationCheck
                                }
                                isAddressValid={
                                    addressValidations[index] &&
                                    addressValidations[index]!.isAddressValid
                                }
                                isQuantityValid={
                                    quantityValidations[index] &&
                                    quantityValidations[index]!.isQuantityValid
                                }
                                addressError={
                                    addressValidations[index] &&
                                    addressValidations[index]!.addressError
                                }
                                quantityError={
                                    quantityValidations[index] &&
                                    quantityValidations[index]!.quantityError
                                }
                                onRemove={this.handleRemoveReceiver}
                            />
                        ))}
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary add-receiver-btn"
                            onClick={this.handleAddReceiver}
                        >
                            add receiver
                        </button>
                    </div>
                    <div className="mt-5">
                        <button
                            type="submit"
                            className="btn btn-primary square w-100 send-btn"
                            disabled={receivers.length === 0}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    private handleRemoveReceiver = (myIndex: number) => {
        const { receivers } = this.state;
        const receiversExceptIndex = _.clone(receivers);
        _.pullAt(receiversExceptIndex, myIndex);
        this.setState({
            receivers: receiversExceptIndex
        });
    };

    private handleAddReceiver = () => {
        this.setState({
            receivers: [...this.state.receivers, { address: "", quantity: 0 }]
        });
    };

    private calculateRemainingAsset = (myIndex: number) => {
        const { receivers } = this.state;
        const { totalQuantity } = this.props;
        const receiversExceptIndex = _.clone(receivers);
        _.pullAt(receiversExceptIndex, myIndex);
        const currentTotal = _.sumBy(
            receiversExceptIndex,
            receiver => receiver.quantity || 0
        );
        return Math.max(0, totalQuantity - currentTotal);
    };

    private handleAddressValidationCheck = (index: number) => {
        const { receivers } = this.state;
        const address = receivers[index].address;
        if (address) {
            try {
                AssetTransferAddress.fromString(address);
                this.setState({
                    addressValidations: {
                        ...this.state.addressValidations,
                        [index]: {
                            ...this.state.addressValidations[index],
                            isAddressValid: true,
                            addressError: undefined
                        }
                    }
                });
                return true;
            } catch (e) {
                // nothing
            }
        }
        this.setState({
            addressValidations: {
                ...this.state.addressValidations,
                [index]: {
                    ...this.state.addressValidations[index],
                    isAddressValid: false,
                    addressError: "invalid address"
                }
            }
        });
        return false;
    };

    private handleQuantityValidationCheck = (index: number) => {
        const { receivers } = this.state;
        const { totalQuantity } = this.props;
        const currentTotal = _.sumBy(
            receivers,
            receiver => receiver.quantity || 0
        );
        if (this.state.receivers[index].quantity === 0) {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: "minimum value is 1"
                    }
                }
            });
            return false;
        }
        if (currentTotal > totalQuantity) {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: "not enough asset"
                    }
                }
            });
            return false;
        }
        this.setState({
            quantityValidations: {
                ...this.state.quantityValidations,
                [index]: {
                    ...this.state.quantityValidations[index],
                    isQuantityValid: true,
                    quantityError: undefined
                }
            }
        });
        return true;
    };

    private handleAddressChange = (newIndex: number, address: string) => {
        const { receivers } = this.state;
        const newReceivers = _.map(receivers, (receiver, index) => {
            if (index === newIndex) {
                return {
                    address,
                    quantity: receiver.quantity
                };
            }
            return receiver;
        });
        this.setState({
            receivers: newReceivers,
            addressValidations: {
                ...this.state.addressValidations,
                [newIndex]: {
                    ...this.state.addressValidations[newIndex],
                    isAddressValid: undefined,
                    addressError: undefined
                }
            }
        });
    };

    private handleQuantityChange = (newIndex: number, quantity: number) => {
        const { receivers } = this.state;
        const newReceivers = _.map(receivers, (receiver, index) => {
            if (index === newIndex) {
                return {
                    address: receiver.address,
                    quantity
                };
            }
            return receiver;
        });
        this.setState({
            receivers: newReceivers,
            quantityValidations: {
                ...this.state.quantityValidations,
                [newIndex]: {
                    ...this.state.quantityValidations[newIndex],
                    isQuantityValid: undefined,
                    quantityError: undefined
                }
            }
        });
    };

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { receivers } = this.state;

        _.each(receivers, (__, index) => {
            if (!this.handleQuantityValidationCheck(index)) {
                return;
            }
        });

        _.each(receivers, (__, index) => {
            if (!this.handleAddressValidationCheck(index)) {
                return;
            }
        });

        this.props.onSubmit(receivers);
    };
}
