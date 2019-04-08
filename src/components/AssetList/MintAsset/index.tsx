import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import { SignedTransaction, U64 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { connect } from "react-redux";
import * as Spinner from "react-spinkit";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId, WalletAddress } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import accountActions from "../../../redux/account/accountActions";
import chainActions from "../../../redux/chain/chainActions";
import walletActions from "../../../redux/wallet/walletActions";
import { TxUtil } from "../../../utils/transaction";
import ValidationInput from "../../ValidationInput/ValidationInput";
import * as CheckIcon from "./img/check_icon.svg";
import "./index.css";

interface OwnProps {
    onClose: () => void;
    address: string;
}

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
}

interface StateProps {
    platformAddresses?: WalletAddress[] | null;
    availableQuarkList: { [address: string]: U64 | null };
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
    ) => Promise<{}>;
}

const MinimumFee = 100000;

type Props = OwnProps & StateProps & DispatchProps;
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
    }
    public render() {
        const { onClose, platformAddresses, availableQuarkList } = this.props;
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
            isSentTx
        } = this.state;
        return (
            <div className="Mint-asset animated fadeIn">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Mint asset</h2>
                {isSentTx ? (
                    <div className="d-flex align-items-center justify-content-center text-center complete-container">
                        <div className="text-center">
                            <div>
                                <img src={CheckIcon} />
                            </div>
                            <div className="mt-3">
                                <span>COMPLETE!</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="asset-info-container">
                            <ValidationInput
                                labelText="Name"
                                placeholder="name"
                                value={name}
                                onChange={this.handleNameChange}
                                showValidation={false}
                                isValid={isNameValid}
                                error={nameError}
                                onBlur={this.checkNameValidation}
                            />
                            <ValidationInput
                                labelText="Supply"
                                placeholder="supply"
                                value={supply}
                                onChange={this.handleSupplyChange}
                                showValidation={false}
                                isValid={isSupplyValid}
                                error={supplyError}
                                onBlur={this.checkSupplyValidation}
                            />
                            <div className="d-flex">
                                <div className="icon-url-input-container">
                                    <ValidationInput
                                        labelText="Icon URL (Optional)"
                                        placeholder="url"
                                        value={iconURL}
                                        onChange={this.handleIconURLChange}
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
                                    Description (Optional)
                                </span>
                                <textarea
                                    className="form-control description-area"
                                    value={description}
                                    onChange={this.handleDescriptionChange}
                                />
                            </div>
                            {platformAddresses && (
                                // FIXME: This code is duplicated.
                                <div className="d-flex fee-container">
                                    <div className="fee-input-container">
                                        <ValidationInput
                                            value={fee}
                                            onChange={this.handleChangeFee}
                                            showValidation={true}
                                            labelText="FEE"
                                            placeholder={
                                                !feePayer
                                                    ? "select payer"
                                                    : !availableQuarkList[
                                                          feePayer
                                                      ]
                                                        ? "loading..."
                                                        : "100,000 (CCC)"
                                            }
                                            disable={
                                                feePayer == null ||
                                                (feePayer != null &&
                                                    availableQuarkList[
                                                        feePayer
                                                    ] == null)
                                            }
                                            onBlur={this.checkFeeValidation}
                                            isValid={isFeeValid}
                                            error={feeError}
                                        />
                                    </div>
                                    <div className="fee-payer-container">
                                        <div className="input-label">
                                            FEE PAYER
                                        </div>
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
                                                    onChange={
                                                        this
                                                            .handleChangeFeePayer
                                                    }
                                                >
                                                    <option
                                                        value="default"
                                                        disabled={true}
                                                    >
                                                        select address
                                                    </option>
                                                    {platformAddresses.map(
                                                        pa => (
                                                            <option
                                                                value={
                                                                    pa.address
                                                                }
                                                                key={pa.address}
                                                            >
                                                                {pa.name}
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
                                type="submit"
                                className="btn btn-primary square w-100 send-btn"
                                onClick={this.mintAsset}
                            >
                                Mint
                            </button>
                        </div>
                    </div>
                )}
                {isSendingTx && (
                    <div className="minting-panel d-flex align-items-center justify-content-center">
                        <Spinner name="line-scale" color="white" />
                    </div>
                )}
            </div>
        );
    }

    private checkNameValidation = () => {
        const { name } = this.state;
        if (name.trim() === "") {
            this.setState({
                isNameValid: false,
                nameError: "name is required"
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
                supplyError: "supply is required"
            });
            return false;
        }

        const amountSupply = new BigNumber(supply);
        if (amountSupply.isNaN() || amountSupply.lt(0)) {
            this.setState({
                isSupplyValid: false,
                supplyError: "invalid number"
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
                feeError: "select fee payer"
            });
            return false;
        }
        const availableQuark = availableQuarkList[feePayer];
        if (!availableQuark) {
            throw Error("invalid balacne");
        }
        if (fee.trim() === "") {
            this.setState({
                isFeeValid: false,
                feeError: "fee is required"
            });
            return false;
        }
        const amountFee = new BigNumber(fee);
        if (amountFee.isNaN()) {
            this.setState({
                isFeeValid: false,
                feeError: "invalid number"
            });
            return false;
        }
        if (amountFee.lt(MinimumFee)) {
            this.setState({
                isFeeValid: false,
                feeError: `minimum value is ${MinimumFee}`
            });
            return false;
        }

        if (availableQuark.value.lt(amountFee)) {
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
        this.setState({
            feePayer: event.target.value,
            fee: `${MinimumFee}`,
            feeError: undefined,
            isFeeValid: undefined
        });
        this.props.fetchAvailableQuark(event.target.value);
    };

    private mintAsset = async () => {
        const { address, networkId, passphrase } = this.props;
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
            recipient: address,
            networkId,
            fee: new U64(fee),
            feePayer: feePayer!,
            passphrase
        });
        try {
            await this.props.sendSignedTransaction(
                address,
                signedTx,
                feePayer!
            );
            this.setState({ isSentTx: true });
        } catch (e) {
            toast.error("Server is not responding.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 3000,
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
    return {
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
)(MintAsset);
