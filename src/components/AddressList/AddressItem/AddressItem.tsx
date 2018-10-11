import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { WalletAddress } from "../../../model/address";
import { changeQuarkToCCC } from "../../../utils/unit";
import "./AddressItem.css";

interface OwnProps {
    address: WalletAddress;
}

type Props = RouteComponentProps & OwnProps;

const AddressItem = (props: Props) => {
    const { address } = props;
    const handleClick = () => {
        if (address.type === "Platform") {
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
                <span className="address-type">{address.type}</span>
            </div>
            <div className="address-description">
                <span>
                    {address.type === "Asset"
                        ? `${address.totalAmount.toString(10)} Asset types`
                        : `${changeQuarkToCCC(address.totalAmount).toString(
                              10
                          )} CCC`}
                </span>
            </div>
        </div>
    );
};

export default withRouter(AddressItem);
