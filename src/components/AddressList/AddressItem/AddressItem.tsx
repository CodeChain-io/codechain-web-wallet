import * as React from "react";
import "./AddressItem.css";

export default class AddressItem extends React.Component<any, any> {
    public render() {
        return (
            <div className="Address-item mb-3">
                <div>
                    <h6 className="mb-0">First Address</h6>
                </div>
                <div>
                    <span className="address-type">Platform Address</span>
                </div>
                <div className="address-description">
                    <span>10000.00000001 CCC</span>
                </div>
            </div>
        );
    }
}
