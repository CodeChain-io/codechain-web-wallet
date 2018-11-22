import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AddressType, WalletAddress } from "../../../model/address";
import { getNetworkNameById } from "../../../utils/network";
import "./AddressItem.css";

interface OwnProps {
    address: WalletAddress;
    className?: string | null;
}

type Props = RouteComponentProps & OwnProps;

const AddressItem = (props: Props) => {
    const { address, className } = props;
    const handleClick = () => {
        if (address.type === AddressType.Platform) {
            props.history.push(`/${address.address}/account`);
        } else {
            props.history.push(`/${address.address}/assets`);
        }
    };
    return (
        <div className={`Address-item mb-3 ${className}`} onClick={handleClick}>
            <div
                className={`item-body ${
                    address.type === AddressType.Platform
                        ? "platform-type"
                        : "asset-type"
                }`}
            >
                <div className="d-flex network-text-container">
                    <span className="network-text ml-auto">
                        {getNetworkNameById(address.networkId)}
                    </span>
                </div>
                <div>
                    <p className="address-name mb-0 mono">{address.name}</p>
                </div>
                <span className="address-text mono">
                    {address.address.slice(0, 15)}
                    ...
                    {address.address.slice(
                        address.address.length - 15,
                        address.address.length
                    )}
                </span>
            </div>
            {address.type === AddressType.Platform && (
                <div className="platform-account">
                    <span className="mono balance">873.4311 CCC</span>
                </div>
            )}
        </div>
    );
};

export default withRouter(AddressItem);
