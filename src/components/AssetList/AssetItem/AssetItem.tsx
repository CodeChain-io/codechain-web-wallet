import { MetadataFormat } from "codechain-indexer-types/lib/utils";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../../utils/network";
import "./AssetItem.css";

interface OwnProps {
    assetType: string;
    quantities: number;
    metadata: MetadataFormat;
    networkId: string;
    address: string;
}

type Props = RouteComponentProps & OwnProps;

class AssetItem extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public render() {
        const { metadata, assetType, address, quantities } = this.props;
        return (
            <div onClick={this.handleClick} className="Asset-item d-flex mb-3">
                <div className="image-container">
                    <ImageLoader
                        data={assetType}
                        size={65}
                        isAssetImage={true}
                        networkId={getNetworkIdByAddress(address)}
                    />
                </div>
                <div className="name-container d-flex align-items-center">
                    <div className="pl-3">
                        <h6 className="mb-0">{metadata.name || assetType}</h6>
                        <p className="mb-0">x {quantities}</p>
                    </div>
                </div>
            </div>
        );
    }

    private handleClick = () => {
        const { assetType, address } = this.props;
        this.props.history.push(`/${address}/${assetType}`);
    };
}
export default withRouter(AssetItem);
