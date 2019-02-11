import { AssetTransferAddress, U64 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../../../model/address";
import { ReducerConfigure } from "../../../../redux";
import accountActions from "../../../../redux/account/accountActions";
import walletActions from "../../../../redux/wallet/walletActions";
import { changeQuarkToCCCString } from "../../../../utils/unit";
import ValidationInput from "../../../ValidationInput/ValidationInput";
import "./ReceiverContainer.css";
import ReceiverItem from "./ReceiverItem/ReceiverItem";

interface State {
    receivers: {
        address: string;
        quantity: U64;
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
    fee: U64;
    feePayer?: string;
    isFeeValid?: boolean;
    feeError?: string;
}

interface OwnProps {
    address: string;
    totalQuantity: U64;
    onSubmit: (
        receivers: { address: string; quantity: U64 }[],
        fee?: {
            payer: string;
            quantity: U64;
        } | null
    ) => void;
    gatewayURL?: string | null;
}

interface StateProps {
    platformAddresses?: WalletAddress[] | null;
    availableQuarkList: { [address: string]: U64 | null };
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
    fetchAvailableQuark: (address: string) => void;
}

type Props = OwnProps & DispatchProps & StateProps;

class ReceiverContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            receivers: [
                {
                    address: "",
                    quantity: new U64("0")
                }
            ],
            addressValidations: {},
            quantityValidations: {},
            fee: new U64("0"),
            feePayer: undefined,
            isFeeValid: undefined,
            feeError: undefined
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
            fee,
            feePayer,
            isFeeValid,
            feeError
        } = this.state;
        const {
            platformAddresses,
            gatewayURL,
            availableQuarkList
        } = this.props;
        if (!platformAddresses) {
            return <span>Loading...</span>;
        }
        return (
            <div className="Receiver-container">
                <form onSubmit={this.handleSubmit}>
                    <div className="receivers">
                        {_.map(receivers, (receiver, index) => (
                            <ReceiverItem
                                hideCancel={receivers.length === 1}
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
                            Add a new recipient
                        </button>
                    </div>
                    {gatewayURL == null && (
                        <div className="d-flex fee-container">
                            <div className="fee-input-container">
                                <ValidationInput
                                    value={fee.toString(10)}
                                    onChange={this.handleChangeFee}
                                    showValidation={true}
                                    labelText="FEE"
                                    placeholder={
                                        !feePayer
                                            ? "select payer"
                                            : !availableQuarkList[feePayer]
                                                ? "loading..."
                                                : "0.0000001 (CCC)"
                                    }
                                    disable={
                                        feePayer == null ||
                                        (feePayer != null &&
                                            availableQuarkList[feePayer] ==
                                                null)
                                    }
                                    onBlur={this.checkFeeValidation}
                                    isValid={isFeeValid}
                                    error={feeError}
                                />
                            </div>
                            <div className="fee-payer-container">
                                <div className="payer-label">FEE PAYER</div>
                                {platformAddresses.length === 0 ? (
                                    <select
                                        className="form-control"
                                        disabled={true}
                                    >
                                        <option>Empty address</option>
                                    </select>
                                ) : (
                                    <div>
                                        <select
                                            className="form-control"
                                            value={feePayer}
                                            defaultValue={"default"}
                                            onChange={this.handleChangeFeePayer}
                                        >
                                            <option
                                                value="default"
                                                disabled={true}
                                            >
                                                select address
                                            </option>
                                            {_.map(platformAddresses, pa => (
                                                <option
                                                    value={pa.address}
                                                    key={pa.address}
                                                >
                                                    {pa.name}
                                                </option>
                                            ))}
                                        </select>
                                        {feePayer &&
                                            availableQuarkList[feePayer] && (
                                                <span className="available-ccc-text number pl-2 pr-2">
                                                    {changeQuarkToCCCString(
                                                        availableQuarkList[
                                                            feePayer
                                                        ]!
                                                    )}
                                                    CCC
                                                </span>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="submit-btn-container">
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
        this.setState({
            feePayer: event.target.value,
            fee: new U64("0")
        });
        this.props.fetchAvailableQuark(event.target.value);
    };

    private checkFeeValidation = () => {
        const { fee, feePayer } = this.state;
        const { availableQuarkList } = this.props;

        if (!feePayer) {
            this.setState({
                isFeeValid: false,
                feeError: "Select fee payer"
            });
            return false;
        }
        const availableQuark = availableQuarkList[feePayer];
        if (!availableQuark) {
            throw Error("invalid balacne");
        }
        const feeStringToQuark = fee.value.multipliedBy(Math.pow(10, 9));
        if (feeStringToQuark.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: "invalid number"
            });
            return false;
        }
        if (feeStringToQuark.lt(10)) {
            this.setState({
                isFeeValid: false,
                feeError: "minimum 0.00000001"
            });
            return false;
        }

        if (availableQuark.value.lt(feeStringToQuark)) {
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

    private handleChangeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ fee: new U64(event.target.value) });
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
            receivers: [
                ...this.state.receivers,
                { address: "", quantity: new U64(0) }
            ]
        });
    };

    private calculateRemainingAsset = (myIndex: number) => {
        const { receivers } = this.state;
        const { totalQuantity } = this.props;
        const receiversExceptIndex = _.clone(receivers);
        _.pullAt(receiversExceptIndex, myIndex);
        const currentTotal = _.reduce(
            receiversExceptIndex,
            (memo, receiver) => U64.plus(memo, receiver.quantity),
            new U64(0)
        );

        const remainingAsset = U64.minus(totalQuantity, currentTotal);
        if (remainingAsset.gt(0)) {
            return remainingAsset;
        }
        return new U64(0);
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
        const currentTotal = _.reduce(
            receivers,
            (memo, receiver) => U64.plus(memo, receiver.quantity),
            new U64(0)
        );
        if (this.state.receivers[index].quantity.lte(0)) {
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
        if (currentTotal.gt(totalQuantity)) {
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

    private handleQuantityChange = (newIndex: number, quantity: U64) => {
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
        const { gatewayURL } = this.props;
        const { receivers, fee, feePayer } = this.state;

        for (let i = 0; i < receivers.length; i++) {
            if (!this.handleAddressValidationCheck(i)) {
                return;
            }
            if (!this.handleQuantityValidationCheck(i)) {
                return;
            }
        }
        if (gatewayURL == null) {
            if (!this.checkFeeValidation()) {
                return;
            }
            const feeStringToQuark = fee.value.multipliedBy(Math.pow(10, 9));
            this.props.onSubmit(receivers, {
                payer: feePayer!,
                quantity: new U64(feeStringToQuark)
            });
        } else {
            this.props.onSubmit(receivers);
        }
    };
}

const mapStateToProps = (state: ReducerConfigure) => {
    const platformAddresses = state.walletReducer.platformAddresses;
    const availableQuarkList = state.accountReducer.availableQuark;
    return {
        platformAddresses,
        availableQuarkList
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchWalletFromStorageIfNeed: () => {
        dispatch(walletActions.fetchWalletFromStorageIfNeed());
    },
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReceiverContainer);
