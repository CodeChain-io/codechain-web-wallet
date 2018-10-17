import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AddressType, WalletAddress } from "../../../model/address";
import { getNetworkNameById } from "../../../utils/network";
import "./AddressItem.css";

interface OwnProps {
    address: WalletAddress;
}

type Props = RouteComponentProps & OwnProps;

const AddressItem = (props: Props) => {
    const { address } = props;
    const handleClick = () => {
        if (address.type === AddressType.Platform) {
            props.history.push(`/${address.address}/account`);
        } else {
            props.history.push(`/${address.address}/assets`);
        }
    };
    return (
        <div className="Address-item mb-3" onClick={handleClick}>
            <div>
                <h6 className="mb-0">{address.name}</h6>
            </div>
            <div>
                <span className="address-type">
                    {getNetworkNameById(address.networkId)}
                </span>
            </div>
            <div className="address-description">
                <span>{address.address}</span>
            </div>
        </div>
    );
};

export default withRouter(AddressItem);
