import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { AddressType } from "../../../model/address";
import { getNetworkNameById } from "../../../utils/network";
import "./CreatedAddressItem.css";

interface Props {
    address: {
        name: string;
        type: AddressType;
        networkId: string;
    };
    canRemove: boolean;
    onRemove: () => void;
}

export default class CreatedAddressItem extends React.Component<Props, any> {
    public render() {
        const { address, onRemove, canRemove } = this.props;
        return (
            <div className="Created-address-item mt-3">
                <h6>{address.name}</h6>
                <p className="mb-1">
                    {address.type === AddressType.Asset
                        ? "Asset address"
                        : "Platform address"}
                </p>
                <p className="mb-0">{getNetworkNameById(address.networkId)}</p>
                {canRemove && (
                    <div className="remove-btn" onClick={onRemove}>
                        <FontAwesomeIcon icon={"trash-alt"} />
                    </div>
                )}
            </div>
        );
    }
}
