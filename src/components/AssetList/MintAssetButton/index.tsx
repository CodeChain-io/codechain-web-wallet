import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import "./index.css";

export default class MintAssetButton extends React.Component {
    public render() {
        return (
            <div className="Mint-asset-button">
                <span>Mint a new asset</span>
                <FontAwesomeIcon className="ml-2" icon="plus-circle" />
            </div>
        );
    }
}
