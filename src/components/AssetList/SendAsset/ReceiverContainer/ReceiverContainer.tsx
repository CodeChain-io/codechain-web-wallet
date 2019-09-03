import BigNumber from "bignumber.js";
import { AssetTransferAddress, U64 } from "codechain-sdk/lib/core/classes";
import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../../../model/address";
import { ReducerConfigure } from "../../../../redux";
import accountActions from "../../../../redux/account/accountActions";
import walletActions from "../../../../redux/wallet/walletActions";
import TooltipLabel from "../../../TooltipLabel";
import ValidationInput from "../../../ValidationInput/ValidationInput";
import "./ReceiverContainer.css";
import ReceiverItem from "./ReceiverItem/ReceiverItem";

interface State {
    receivers: {
        address: string;
        quantity: string;
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
    fee: string;
    feePayer?: string;
    isFeeValid?: boolean;
    feeError?: string;
    memo: string;
    memoError?: string;
    isMemoValid?: boolean;
}

interface OwnProps {
    address: string;
    totalQuantity: U64;
    onSubmit: (
        receivers: { address: string; quantity: U64 }[],
        memo: string,
        fee?: {
            payer: string;
            quantity: U64;
        } | null
    ) => void;
    gatewayURL?: string | null;
    isSendingTx: boolean;
}

interface StateProps {
    platformAddresses?: WalletAddress[] | null;
    availableQuarkList: { [address: string]: U64 | null | undefined };
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
    fetchAvailableQuark: (address: string) => void;
}

type Props = WithTranslation & OwnProps & DispatchProps & StateProps;

const MinimumFee = 100;
class ReceiverContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            receivers: [
                {
                    address: "",
                    quantity: ""
                }
            ],
            addressValidations: {},
            quantityValidations: {},
            fee: "",
            feePayer: undefined,
            isFeeValid: undefined,
            feeError: undefined,
            memo: "",
            memoError: undefined,
            isMemoValid: undefined
        };
    }
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
        if (this.props.platformAddresses) {
            if (this.props.platformAddresses.length > 0) {
                this.selectFeePayer(this.props.platformAddresses[0].address);
            }
        }
    }
    public componentWillUpdate(nextProps: Props) {
        if (!this.props.platformAddresses && nextProps.platformAddresses) {
            if (nextProps.platformAddresses) {
                if (nextProps.platformAddresses.length > 0) {
                    this.selectFeePayer(nextProps.platformAddresses[0].address);
                }
            }
        }
    }
    public render() {
        const {
            receivers,
            addressValidations,
            quantityValidations,
            fee,
            feePayer,
            isFeeValid,
            feeError,
            memo,
            memoError,
            isMemoValid
        } = this.state;
        const {
            t,
            platformAddresses,
            gatewayURL,
            availableQuarkList,
            isSendingTx
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
                    {receivers.length < 10 && (
                        <div>
                            <button
                                type="button"
                                className="btn btn-primary add-receiver-btn"
                                onClick={this.handleAddReceiver}
                            >
                                <Trans i18nKey="send:asset.add" />
                            </button>
                        </div>
                    )}
                    <div className="memo-container">
                        <ValidationInput
                            labelText={t("send:asset.memo.label")}
                            value={memo}
                            isValid={isMemoValid}
                            error={memoError}
                            showValidation={true}
                            placeholder={t("send:asset.memo.placeholder")}
                            onBlur={this.checkMemo}
                            onChange={this.handleChangeMemo}
                        />
                    </div>
                    {gatewayURL == null && (
                        <div className="d-flex fee-container">
                            <div className="fee-input-container">
                                <ValidationInput
                                    value={fee}
                                    onChange={this.handleChangeFee}
                                    showValidation={true}
                                    labelText={t("send:asset.fee.label")}
                                    type="number"
                                    decimalScale={0}
                                    placeholder={
                                        !feePayer
                                            ? "select payer"
                                            : !availableQuarkList[feePayer]
                                            ? "loading..."
                                            : "100 (CCC)"
                                    }
                                    tooltip="send:asset.fee.tooltip"
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
                                <div className="payer-label">
                                    <Trans i18nKey="send:asset.payer.label" />
                                    <TooltipLabel tooltip="send:asset.payer.tooltip" />
                                </div>
                                {platformAddresses.length === 0 ? (
                                    <select
                                        className="form-control"
                                        disabled={true}
                                    >
                                        <option>
                                            {t("send:asset.payer.empty")}
                                        </option>
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
                                                {t("send:asset.payer.select")}
                                            </option>
                                            {_.map(platformAddresses, pa => (
                                                <option
                                                    value={pa.address}
                                                    key={pa.address}
                                                >
                                                    CCC{" "}
                                                    {t("main:address", {
                                                        index: pa.index + 1
                                                    })}
                                                </option>
                                            ))}
                                        </select>
                                        {feePayer &&
                                            availableQuarkList[feePayer] && (
                                                <span className="available-ccc-text number pl-2 pr-2">
                                                    {availableQuarkList[
                                                        feePayer
                                                    ]!.toLocaleString()}
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
                            disabled={isSendingTx}
                        >
                            <Trans i18nKey="send:asset.button" />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    private handleChangeFeePayer = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        this.selectFeePayer(event.target.value);
    };

    private selectFeePayer = (address: string) => {
        this.setState({
            feePayer: address,
            fee: `${MinimumFee}`,
            feeError: undefined,
            isFeeValid: undefined
        });
        this.props.fetchAvailableQuark(address);
    };

    private handleChangeMemo = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            memo: event.target.value
        });
    };

    private checkMemo = () => {
        const { t } = this.props;
        const { memo } = this.state;
        if (memo.length > 25) {
            this.setState({
                isMemoValid: false,
                memoError: t("send:asset.error.memo.maximum")
            });
            return false;
        }
        this.setState({
            isMemoValid: true,
            memoError: undefined
        });
        return true;
    };

    private checkFeeValidation = () => {
        const { fee, feePayer } = this.state;
        const { t, availableQuarkList } = this.props;

        if (!feePayer) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:asset.error.fee.not_selected")
            });
            return false;
        }
        const availableQuark = availableQuarkList[feePayer];
        if (!availableQuark) {
            throw Error(t("send:asset.error.fee.invalid_balance"));
        }
        if (fee === "") {
            this.setState({
                isFeeValid: false,
                feeError: t("send:asset.error.fee.required")
            });
            return false;
        }
        const amountFee = new BigNumber(fee);
        if (amountFee.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:asset.error.fee.invalid")
            });
            return false;
        }
        if (amountFee.lt(MinimumFee)) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:asset.error.fee.minimum", {
                    minimum: MinimumFee
                })
            });
            return false;
        }

        if (availableQuark.value.lt(amountFee)) {
            this.setState({
                isFeeValid: false,
                feeError: t("send:asset.error.fee.not_enough")
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
        this.setState({
            fee: event.target.value
        });
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
            receivers: [...this.state.receivers, { address: "", quantity: "" }]
        });
    };

    private calculateRemainingAsset = (myIndex: number) => {
        const { receivers } = this.state;
        const { totalQuantity } = this.props;
        const receiversExceptIndex = _.clone(receivers);
        _.pullAt(receiversExceptIndex, myIndex);
        const currentTotal = _.reduce(
            receiversExceptIndex,
            (memo, receiver) =>
                U64.plus(
                    memo,
                    receiver.quantity === "" ? 0 : receiver.quantity
                ),
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
        const { t, address: myAddress } = this.props;
        const address = receivers[index].address;
        if (address === "") {
            this.setState({
                addressValidations: {
                    ...this.state.addressValidations,
                    [index]: {
                        ...this.state.addressValidations[index],
                        isAddressValid: false,
                        addressError: t("send:asset.error.receiver.required")
                    }
                }
            });
            return false;
        }
        if (address === myAddress) {
            this.setState({
                addressValidations: {
                    ...this.state.addressValidations,
                    [index]: {
                        ...this.state.addressValidations[index],
                        isAddressValid: false,
                        addressError: t(
                            "send:asset.error.receiver.not_available"
                        )
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
        this.setState({
            addressValidations: {
                ...this.state.addressValidations,
                [index]: {
                    ...this.state.addressValidations[index],
                    isAddressValid: false,
                    addressError: t("send:asset.error.receiver.invalid")
                }
            }
        });
        return false;
    };

    private handleQuantityValidationCheck = (index: number) => {
        const { receivers } = this.state;
        const { t, totalQuantity } = this.props;
        const quantityString = this.state.receivers[index].quantity;
        if (quantityString === "") {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: t("send:asset.error.quantity.required")
                    }
                }
            });
            return false;
        }
        const quantity = new BigNumber(quantityString);
        if (quantity.isNaN()) {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: t("send:asset.error.quantity.invalid")
                    }
                }
            });
            return false;
        }
        if (quantity.lte(0)) {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: t("send:asset.error.quantity.minimum")
                    }
                }
            });
            return false;
        }
        const currentTotal = _.reduce(
            receivers,
            (memo, receiver) =>
                U64.plus(
                    memo,
                    receiver.quantity === "" ? 0 : receiver.quantity
                ),
            new U64(0)
        );
        if (currentTotal.gt(totalQuantity)) {
            this.setState({
                quantityValidations: {
                    ...this.state.quantityValidations,
                    [index]: {
                        ...this.state.quantityValidations[index],
                        isQuantityValid: false,
                        quantityError: t("send:asset.error.quantity.not_enough")
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

    private handleQuantityChange = (newIndex: number, quantity: string) => {
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
        const { receivers, fee, feePayer, memo } = this.state;

        for (let i = 0; i < receivers.length; i++) {
            if (!this.handleAddressValidationCheck(i)) {
                return;
            }
            if (!this.handleQuantityValidationCheck(i)) {
                return;
            }
        }

        if (!this.checkMemo()) {
            return;
        }

        const returnValue = receivers.map(r => ({
            address: r.address,
            quantity: new U64(r.quantity)
        }));
        if (gatewayURL == null) {
            if (!this.checkFeeValidation()) {
                return;
            }
            this.props.onSubmit(returnValue, memo, {
                payer: feePayer!,
                quantity: new U64(fee)
            });
        } else {
            this.props.onSubmit(returnValue, memo);
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
)(withTranslation()(ReceiverContainer));
