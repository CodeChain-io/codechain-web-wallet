import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { AddressUTXO } from "../../../model/asset";
import { getAssetByAssetType } from "../../../networks/Api";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import "./AssetItem.css";

interface Props {
    addressUTXO: AddressUTXO;
}

interface State {
    assetScheme?: AssetSchemeDoc;
}

class AssetItem extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            assetScheme: undefined
        };
    }
    public async componentDidMount() {
        const { addressUTXO } = this.props;
        try {
            const assetScheme = await getAssetByAssetType(
                new H256(addressUTXO.assetType)
            );
            this.setState({ assetScheme });
        } catch (e) {
            console.log(e);
        }
    }
    public render() {
        const { addressUTXO } = this.props;
        const { assetScheme } = this.state;
        if (!assetScheme) {
            return <div>Loading...</div>;
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Asset-item d-flex">
                <div className="image-container pt-1 pb-1">
                    <ImageLoader
                        data={addressUTXO.assetType}
                        size={65}
                        isAssetImage={true}
                    />
                </div>
                <div className="name-container d-flex align-items-center">
                    <div className="pl-2 pr-2">
                        <h6 className="mb-0">{metadata.name}</h6>
                        <p className="mb-0">{addressUTXO.totalAssetQuantity}</p>
                    </div>
                </div>
                <div className="btn-container d-flex align-items-center">
                    Send
                </div>
            </div>
        );
    }
}

export default AssetItem;
