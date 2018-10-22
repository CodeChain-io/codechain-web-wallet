import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as _ from "lodash";
import * as React from "react";
import { AddressType } from "../../model/address";
import { createKey, saveWallet, setWalletName } from "../../model/wallet";
import "./CreateAddressContainer.css";
import CreateAddressForm from "./CreateAddressForm/CreateAddressForm";
import CreatedAddressItem from "./CreatedAddressItem/CreatedAddressItem";

interface Props {
    onCancel: () => void;
    onSubmit: () => void;
    walletName: string;
}

interface State {
    isCreating: boolean;
    addressList: {
        name: string;
        type: AddressType;
        password: string;
        networkId: string;
    }[];
    isWalletCreated: boolean;
}

export default class CreateAddressContainer extends React.Component<
    Props,
    State
> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCreating: false,
            addressList: [],
            isWalletCreated: false
        };
    }
    public render() {
        const { onCancel, onSubmit } = this.props;
        const { isCreating, addressList, isWalletCreated } = this.state;
        return (
            <div className="Create-address-container">
                <h4>Create new address</h4>
                {isCreating ? (
                    <CreateAddressForm
                        onCancel={this.handleCancelCreating}
                        onSubmit={this.handleSubmitCreating}
                    />
                ) : (
                    <div>
                        <div>
                            {_.map(addressList, (address, index) => (
                                <CreatedAddressItem
                                    key={index}
                                    address={address}
                                    onRemove={_.partial(
                                        this.handleRemove,
                                        index
                                    )}
                                    canRemove={!isWalletCreated}
                                />
                            ))}
                        </div>
                        {!isWalletCreated ? (
                            <div>
                                <div
                                    className="add-btn d-flex justify-content-center align-items-center mt-3"
                                    onClick={this.handleAddingAddress}
                                >
                                    <FontAwesomeIcon icon="plus" />
                                </div>
                                <div className="d-flex button-container mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary ml-auto mr-3"
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.handleSubmit}
                                        disabled={addressList.length === 0}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div
                                    onClick={this.onClickSaveButton}
                                    className="download-btn mt-3 d-flex justify-content-center align-items-center"
                                >
                                    <FontAwesomeIcon
                                        className="mr-1"
                                        icon="file-download"
                                    />
                                    Download
                                </div>
                                <div className="d-flex button-container mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary ml-auto"
                                        onClick={onSubmit}
                                        disabled={addressList.length === 0}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    private handleAddingAddress = () => {
        this.setState({ isCreating: true });
    };

    private handleCancelCreating = () => {
        this.setState({ isCreating: false });
    };

    private handleRemove = (index: number) => {
        const results = [...this.state.addressList];
        results.splice(index, 1);
        this.setState({
            addressList: results
        });
    };

    private handleSubmitCreating = (
        type: AddressType,
        name: string,
        password: string,
        networkId: string
    ) => {
        const newAddress = {
            type,
            name,
            password,
            networkId
        };
        this.setState({
            isCreating: false,
            addressList: _.concat(this.state.addressList, newAddress)
        });
    };

    private onClickSaveButton = async () => {
        const { walletName } = this.props;
        await saveWallet(walletName);
    };

    private handleSubmit = async () => {
        const { walletName } = this.props;
        const { addressList } = this.state;
        await setWalletName(walletName);
        await Promise.all(
            _.map(addressList, async address => {
                return createKey(
                    address.type,
                    address.name,
                    address.password,
                    address.networkId
                );
            })
        );
        this.setState({ isWalletCreated: true });
    };
}
