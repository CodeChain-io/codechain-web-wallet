import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import "./index.css";

interface Props {
    isSelected: boolean;
    onSelect: () => void;
}

export default class MintAssetButton extends React.Component<Props> {
    public render() {
        const { isSelected } = this.props;
        return (
            <div
                onClick={this.props.onSelect}
                className={`Mint-asset-button ${
                    isSelected ? "selected" : null
                }`}
            >
                <span>Mint a new asset</span>
                <FontAwesomeIcon className="ml-2" icon="plus-circle" />
            </div>
        );
    }
}
