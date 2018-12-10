import { AssetTransferAddress, U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../../../model/address";
import { ReducerConfigure } from "../../../../redux";
import walletActions from "../../../../redux/wallet/walletActions";
import ValidationInput from "../../../ValidationInput/ValidationInput";
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
    feeString: string;
    feePayer?: string;
}

interface OwnProps {
    address: string;
    totalQuantity: number;
    onSubmit: (
        receivers: { address: string; quantity: number }[],
        fee?: {
            payer: string;
            amount: U256;
        } | null
    ) => void;
    gatewayURL?: string | null;
}

interface StateProps {
    platformAddresses?: WalletAddress[] | null;
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
}

type Props = OwnProps & DispatchProps & StateProps;

class ReceiverContainer extends React.Component<Props, State> {
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
            quantityValidations: {},
            feeString: props.gatewayURL ? "0" : "0.01",
            feePayer: undefined
        };
    }
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
    }
    public render() {
        const {
            receivers,
            addressValidations,
            quantityValidations,
            feeString,
            feePayer
        } = this.state;
        const { platformAddresses, gatewayURL } = this.props;
        if (!platformAddresses) {
            return <span>Loading...</span>;
        }
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
                    <div className="d-flex mt-5">
                        <div className="fee-input-container">
                            <ValidationInput
                                value={feeString}
                                onChange={this.handleChangeFee}
                                showValidation={true}
                                labelText="FEE"
                                placeholder="fee (CCC)"
                                disable={gatewayURL != null}
                            />
                        </div>
                        <div className="fee-payer-container">
                            <div className="payer-label">FEE PAYER</div>
                            {gatewayURL != null ? (
                                <select
                                    className="form-control"
                                    disabled={true}
                                >
                                    <option>Gateway</option>
                                </select>
                            ) : platformAddresses.length === 0 ? (
                                <select
                                    className="form-control"
                                    disabled={true}
                                >
                                    <option>Empty address</option>
                                </select>
                            ) : (
                                <select
                                    className="form-control"
                                    value={feePayer}
                                    defaultValue={platformAddresses[0].address}
                                    onChange={this.handleChangeFeePayer}
                                >
                                    {_.map(platformAddresses, pa => (
                                        <option
                                            value={pa.address}
                                            key={pa.address}
                                        >
                                            {pa.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="mt-2">
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

    private handleChangeFeePayer = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        console.log(event.target.value);
    };

    private handleChangeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ feeString: event.target.value });
    };

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
        const { address: myAddress } = this.props;
        const address = receivers[index].address;
        if (address) {
            if (address === myAddress) {
                this.setState({
                    addressValidations: {
                        ...this.state.addressValidations,
                        [index]: {
                            ...this.state.addressValidations[index],
                            isAddressValid: false,
                            addressError: "can't send asset to sender's address"
                        }
                    }
                });
                return false;
            }
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

        for (let i = 0; i < receivers.length; i++) {
            if (!this.handleAddressValidationCheck(i)) {
                return;
            }
            if (!this.handleQuantityValidationCheck(i)) {
                return;
            }
        }

        this.props.onSubmit(receivers);
    };
}

const mapStateToProps = (state: ReducerConfigure) => {
    const platformAddresses = state.walletReducer.platformAddresses;
    return {
        platformAddresses
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceiverContainer);
