import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetadataFormat } from "codechain-indexer-types/lib/utils";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { NetworkId } from "../../../model/address";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import "./AssetItem.css";

interface OwnProps {
    assetType: string;
    quantities: number;
    metadata: MetadataFormat;
    networkId: NetworkId;
    address: string;

    isSelected: boolean;
    onSelect: (assetType: string) => void;
}

type Props = RouteComponentProps & OwnProps;

class AssetItem extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public render() {
        const {
            metadata,
            assetType,
            quantities,
            networkId,
            isSelected
        } = this.props;
        return (
            <div
                onClick={this.handleClick}
                className={`Asset-item animated-fadeIn ${isSelected &&
                    "selected"}`}
            >
                <div className="d-flex align-items-center">
                    <div className="image-container">
                        <ImageLoader
                            data={assetType}
                            size={48}
                            isAssetImage={true}
                            networkId={networkId}
                        />
                    </div>
                    <div className="name-container">
                        <span className="mb-0 asset-name">
                            {metadata.name ||
                                `...${assetType.slice(
                                    assetType.length - 8,
                                    assetType.length
                                )}`}
                        </span>
                    </div>
                    <span className="mb-0 number asset-quantities">
                        {quantities.toLocaleString()}
                    </span>
                    <div onClick={this.handleClickInfo} className="info-icon">
                        <FontAwesomeIcon icon="info-circle" />
                    </div>
                </div>
            </div>
        );
    }

    private handleClick = () => {
        const { assetType, onSelect } = this.props;
        onSelect(assetType);
    };

    private handleClickInfo = () => {
        const { assetType, address } = this.props;
        this.props.history.push(`/${address}/${assetType}`);
    };
}
export default withRouter(AssetItem);
