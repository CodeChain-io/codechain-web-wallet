import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { AddressType, WalletAddress } from "../../../model/address";
import { getNetworkNameById } from "../../../utils/network";
import "./CreatedAddressItem.css";
import * as mainnet from "./img/mainnet.svg";
import * as testnet from "./img/testnet.svg";

interface Props {
    data: WalletAddress;
    onRemove: (address: string) => void;
}

export default class CreatedAddressItem extends React.Component<Props, any> {
    public render() {
        const { data } = this.props;
        return (
            <div
                className={`Created-address-item mb-3 ${
                    data.type === AddressType.Asset ? "asset" : "platform"
                }`}
            >
                <div>
                    <span className="mr-2 address-type">
                        {data.type === AddressType.Asset ? "ASSET" : "PLATFORM"}
                    </span>
                    <span className="network-text">
                        {getNetworkNameById(data.networkId)}
                    </span>
                    <img
                        className="ml-2"
                        src={`${data.networkId === "cc" ? mainnet : testnet}`}
                    />
                </div>
                <p className="address-name mb-0 mono">{data.name}</p>
                <p className="mb-0 mono address-string">
                    {data.address.slice(0, 12)}
                    ...
                    {data.address.slice(
                        data.address.length - 12,
                        data.address.length
                    )}
                </p>
                <div className="remove-btn" onClick={this.handleRemoveButton}>
                    <FontAwesomeIcon icon="times" />
                </div>
            </div>
        );
    }
    private handleRemoveButton = () => {
        const { onRemove, data } = this.props;
        onRemove(data.address);
    };
}
