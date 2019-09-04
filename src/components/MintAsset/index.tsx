import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import { SignedTransaction, U64 } from "codechain-sdk/lib/core/classes";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link, RouteComponentProps } from "react-router-dom";
import Spinner from "react-spinkit";
import { toast } from "react-toastify";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId, WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import accountActions from "../../redux/account/accountActions";
import chainActions from "../../redux/chain/chainActions";
import walletActions from "../../redux/wallet/walletActions";
import { TxUtil } from "../../utils/transaction";
import TooltipLabel from "../TooltipLabel";
import ValidationInput from "../ValidationInput/ValidationInput";
import CheckIcon from "./img/check_icon.svg";
import "./index.css";

interface State {
    name: string;
    iconURL: string;
    supply: string;
    description: string;
    feePayer?: string;
    fee: string;
    nameError?: string;
    isNameValid?: boolean;
    supplyError?: string;
    isSupplyValid?: boolean;
    isFeeValid?: boolean;
    feeError?: string;
    isSendingTx: boolean;
    isSentTx: boolean;
    selectedAddress?: string;
}

interface StateProps {
    assetAddresses?: WalletAddress[] | null;
    platformAddresses?: WalletAddress[] | null;
    availableQuarkList: { [address: string]: U64 | null | undefined };
    networkId: NetworkId;
    passphrase: string;
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
    fetchAvailableQuark: (address: string) => void;
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction,
        feePayer: string
    ) => Promise<unknown>;
}

const MinimumFee = 100000;

type Props = WithTranslation & RouteComponentProps & StateProps & DispatchProps;
class MintAsset extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            name: "",
            iconURL: "",
            supply: "",
            description: "",
            feePayer: undefined,
            fee: "",
            isSendingTx: false,
            isSentTx: false
        };
    }
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
        if (this.props.assetAddresses) {
            if (this.props.assetAddresses.length > 0) {
                this.setState({
                    selectedAddress: this.props.assetAddresses[0].address
                });
            }
        }
        if (this.props.platformAddresses) {
            if (this.props.platformAddresses.length > 0) {
                this.selectFeePayer(this.props.platformAddresses[0].address);
            }
        }
    }
    public componentWillUpdate(nextProps: Props) {
        if (!this.props.assetAddresses && nextProps.assetAddresses) {
            if (nextProps.assetAddresses.length > 0) {
                this.setState({
                    selectedAddress: nextProps.assetAddresses[0].address
                });
            }
        }
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
            t,
            platformAddresses,
            availableQuarkList,
            assetAddresses
        } = this.props;
        const {
            name,
            iconURL,
            supply,
            description,
            feePayer,
            fee,
            nameError,
            isNameValid,
            supplyError,
            isSupplyValid,
            isFeeValid,
            feeError,
            isSendingTx,
            isSentTx,
            selectedAddress
        } = this.state;
        return (
            <div className="Mint-asset">
                <Container>
                    <div className="page-container d-flex mb-4 back-icon-container">
                        <Link to="/" className="ml-auto">
                            <FontAwesomeIcon
                                className="back-icon"
                                icon="arrow-left"
                            />
                        </Link>
                    </div>
                    <div className="page-container mint-container">
                        <h2 className="title">
                            <Trans i18nKey="mint:title" />
                        </h2>
                        <span className="mint-description">
                            <Trans i18nKey="mint:detail" />
                        </span>
                        {!assetAddresses ? (
                            <span className="loading-text">
                                <Trans i18nKey="mint:loading" />
                            </span>
                        ) : selectedAddress ? (
                            <div>
                                {isSentTx ? (
                                    <div className="d-flex align-items-center justify-content-center text-center complete-container">
                                        <div className="text-center">
                                            <div>
                                                <img
                                                    src={CheckIcon}
                                                    alt={"check"}
                                                />
                                            </div>
                                            <div className="mt-3">
                                                <span>
                                                    <Trans i18nKey="mint:complete" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="asset-info-container">
                                            <ValidationInput
                                                labelText={t("mint:name.label")}
                                                placeholder={t(
                                                    "mint:name.placeholder"
                                                )}
                                                value={name}
                                                onChange={this.handleNameChange}
                                                showValidation={false}
                                                isValid={isNameValid}
                                                error={nameError}
                                                onBlur={
                                                    this.checkNameValidation
                                                }
                                            />
                                            <ValidationInput
                                                labelText={t(
                                                    "mint:supply.label"
                                                )}
                                                decimalScale={0}
                                                placeholder={t(
                                                    "mint:supply.placeholder"
                                                )}
                                                value={supply}
                                                type="number"
                                                onChange={
                                                    this.handleSupplyChange
                                                }
                                                showValidation={false}
                                                isValid={isSupplyValid}
                                                error={supplyError}
                                                tooltip={t(
                                                    "mint:supply.tooltip"
                                                )}
                                                onBlur={
                                                    this.checkSupplyValidation
                                                }
                                            />
                                            <div className="d-flex">
                                                <div className="icon-url-input-container">
                                                    <ValidationInput
                                                        labelText={t(
                                                            "mint:url.label"
                                                        )}
                                                        placeholder={t(
                                                            "mint:url.placeholder"
                                                        )}
                                                        value={iconURL}
                                                        onChange={
                                                            this
                                                                .handleIconURLChange
                                                        }
                                                        tooltip={t(
                                                            "mint:url.tooltip"
                                                        )}
                                                        showValidation={false}
                                                    />
                                                </div>
                                                {iconURL !== "" && (
                                                    <div
                                                        className="preview-container"
                                                        style={{
                                                            backgroundImage: `URL(${iconURL})`
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="mb-4">
                                                <span className="input-label d-block mb-2">
                                                    <Trans i18nKey="mint:description.title" />
                                                    <TooltipLabel tooltip="mint:description.tooltip" />
                                                </span>
                                                <textarea
                                                    className="form-control description-area"
                                                    value={description}
                                                    onChange={
                                                        this
                                                            .handleDescriptionChange
                                                    }
                                                />
                                            </div>
                                            <div className="select-address-container">
                                                <span className="select-address-label">
                                                    <Trans i18nKey="mint:address.title" />
                                                    <TooltipLabel tooltip="mint:address.tooltip" />
                                                </span>
                                                <select
                                                    onChange={
                                                        this
                                                            .handleChangeSelectAddress
                                                    }
                                                    className="form-control"
                                                >
                                                    {assetAddresses.map(a => (
                                                        <option
                                                            key={a.address}
                                                            value={a.address}
                                                        >
                                                            {t(
                                                                "mint:address.address_type"
                                                            )}{" "}
                                                            {t("main:address", {
                                                                index:
                                                                    a.index + 1
                                                            })}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {platformAddresses && (
                                                // FIXME: This code is duplicated.
                                                <div className="d-flex fee-container">
                                                    <div className="fee-input-container">
                                                        <ValidationInput
                                                            value={fee}
                                                            decimalScale={0}
                                                            onChange={
                                                                this
                                                                    .handleChangeFee
                                                            }
                                                            type="number"
                                                            showValidation={
                                                                true
                                                            }
                                                            labelText={t(
                                                                "mint:fee.title"
                                                            )}
                                                            tooltip={t(
                                                                "mint:fee.tooltip"
                                                            )}
                                                            placeholder={
                                                                !feePayer
                                                                    ? t(
                                                                          "mint:fee.placeholder_select_fee_payer"
                                                                      )
                                                                    : !availableQuarkList[
                                                                          feePayer
                                                                      ]
                                                                    ? t(
                                                                          "mint:fee.placeholder_loading"
                                                                      )
                                                                    : "100,000 (CCC)"
                                                            }
                                                            disable={
                                                                feePayer ==
                                                                    null ||
                                                                (feePayer !=
                                                                    null &&
                                                                    availableQuarkList[
                                                                        feePayer
                                                                    ] == null)
                                                            }
                                                            onBlur={
                                                                this
                                                                    .checkFeeValidation
                                                            }
                                                            isValid={isFeeValid}
                                                            error={feeError}
                                                        />
                                                    </div>
                                                    <div className="fee-payer-container">
                                                        <div className="input-label">
                                                            <Trans i18nKey="mint:payer.title" />
                                                            <TooltipLabel tooltip="mint:payer.tooltip" />
                                                        </div>
                                                        {platformAddresses.length ===
                                                        0 ? (
                                                            <select
                                                                className="form-control"
                                                                disabled={true}
                                                            >
                                                                <option>
                                                                    {t(
                                                                        "mint:payer.no_address"
                                                                    )}
                                                                </option>
                                                            </select>
                                                        ) : (
                                                            <div>
                                                                <select
                                                                    className="form-control"
                                                                    value={
                                                                        feePayer
                                                                    }
                                                                    defaultValue={
                                                                        "default"
                                                                    }
                                                                    onChange={
                                                                        this
                                                                            .handleChangeFeePayer
                                                                    }
                                                                >
                                                                    <option
                                                                        value="default"
                                                                        disabled={
                                                                            true
                                                                        }
                                                                    >
                                                                        {t(
                                                                            "mint:payer.select_address"
                                                                        )}
                                                                    </option>
                                                                    {platformAddresses.map(
                                                                        pa => (
                                                                            <option
                                                                                value={
                                                                                    pa.address
                                                                                }
                                                                                key={
                                                                                    pa.address
                                                                                }
                                                                            >
                                                                                CCC{" "}
                                                                                {t(
                                                                                    "main:address",
                                                                                    {
                                                                                        index:
                                                                                            pa.index +
                                                                                            1
                                                                                    }
                                                                                )}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                                {feePayer &&
                                                                    availableQuarkList[
                                                                        feePayer
                                                                    ] && (
                                                                        <span className="available-ccc-text number pl-2 pr-2">
                                                                            {availableQuarkList[
                                                                                feePayer
                                                                            ]!.toLocaleString()}{" "}
                                                                            CCC
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="submit-btn-container">
                                            <button
                                                disabled={isSendingTx}
                                                type="submit"
                                                className="btn btn-primary square w-100 send-btn"
                                                onClick={this.mintAsset}
                                            >
                                                <Trans
                                                    i18nKey={"mint:mint_btn"}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isSendingTx && (
                                    <div className="minting-panel d-flex align-items-center justify-content-center">
                                        <Spinner
                                            name="line-scale"
                                            color="white"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="no-address-label">
                                <Trans i18nKey="mint:error.asset.required" />
                            </span>
                        )}
                    </div>
                </Container>
            </div>
        );
    }

    private handleChangeSelectAddress = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        this.setState({ selectedAddress: event.target.value });
    };

    private checkNameValidation = () => {
        const { name } = this.state;
        if (name.trim() === "") {
            this.setState({
                isNameValid: false,
                nameError: this.props.t("mint:error.name.required")
            });
            return false;
        }
        this.setState({
            isNameValid: true,
            nameError: undefined
        });
        return true;
    };

    private checkSupplyValidation = () => {
        const { supply } = this.state;
        if (supply.trim() === "") {
            this.setState({
                isSupplyValid: false,
                supplyError: this.props.t("mint:error.supply.required")
            });
            return false;
        }

        const amountSupply = new BigNumber(supply);
        if (amountSupply.isNaN() || amountSupply.lt(0)) {
            this.setState({
                isSupplyValid: false,
                supplyError: this.props.t("mint:error.supply.invalid")
            });
            return false;
        }

        this.setState({
            isSupplyValid: true,
            supplyError: undefined
        });
        return true;
    };

    private checkFeeValidation = () => {
        const { fee, feePayer } = this.state;
        const { availableQuarkList } = this.props;

        if (!feePayer) {
            this.setState({
                isFeeValid: false,
                feeError: this.props.t("mint:error.fee.not_selected")
            });
            return false;
        }
        const availableQuark = availableQuarkList[feePayer];
        if (!availableQuark) {
            throw Error(this.props.t("mint:error.fee.invalid_balance"));
        }
        if (fee.trim() === "") {
            this.setState({
                isFeeValid: false,
                feeError: this.props.t("mint:error.fee.required")
            });
            return false;
        }
        const amountFee = new BigNumber(fee);
        if (amountFee.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: this.props.t("mint:error.fee.invalid")
            });
            return false;
        }
        if (amountFee.lt(MinimumFee)) {
            this.setState({
                isFeeValid: false,
                feeError: this.props.t("mint:error.fee.minimum", {
                    fee: MinimumFee
                })
            });
            return false;
        }

        if (availableQuark.value.lt(amountFee)) {
            this.setState({
                isFeeValid: false,
                feeError: this.props.t("mint:error.fee.minimum_balance")
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

    private handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            name: event.target.value
        });
    };

    private handleDescriptionChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        this.setState({
            description: event.target.value
        });
    };

    private handleIconURLChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            iconURL: event.target.value
        });
    };

    private handleSupplyChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        this.setState({
            supply: event.target.value
        });
    };

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

    private mintAsset = async () => {
        const { networkId, passphrase } = this.props;
        const { selectedAddress: address } = this.state;
        const {
            name,
            description,
            supply,
            iconURL,
            fee,
            feePayer
        } = this.state;
        if (!this.checkNameValidation()) {
            return;
        }
        if (!this.checkSupplyValidation()) {
            return;
        }
        if (!this.checkFeeValidation()) {
            return;
        }
        this.setState({ isSendingTx: true });
        const signedTx = await TxUtil.createMintAssetTx({
            name,
            supply: new U64(supply),
            iconURL,
            description,
            recipient: address!,
            networkId,
            fee: new U64(fee),
            feePayer: feePayer!,
            passphrase
        });
        try {
            await this.props.sendSignedTransaction(
                address!,
                signedTx,
                feePayer!
            );
            this.setState({ isSentTx: true });
        } catch (e) {
            toast.error("Server is not responding.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
            console.error(e);
        }
        this.setState({ isSendingTx: false });
    };
}

const mapStateToProps = (state: ReducerConfigure) => {
    const platformAddresses = state.walletReducer.platformAddresses;
    const availableQuarkList = state.accountReducer.availableQuark;
    const passphrase = state.globalReducer.passphrase!;
    const networkId = state.globalReducer.networkId;
    const assetAddresses = state.walletReducer.assetAddresses;
    return {
        assetAddresses,
        platformAddresses,
        availableQuarkList,
        passphrase,
        networkId
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
    },
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction,
        feePayer: string
    ) => {
        return dispatch(
            chainActions.sendSignedTransaction(
                address,
                signedTransaction,
                feePayer
            )
        );
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(MintAsset));
