import { TransactionDoc } from "codechain-indexer-types";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import MediaQuery from "react-responsive";
import { NetworkId } from "../../../model/address";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import * as Metadata from "../../../utils/metadata";
import { getExplorerHost } from "../../../utils/network";
import { TxUtil } from "../../../utils/transaction";

import { U64 } from "codechain-sdk/lib/core/classes";
import "./AssetTxItem.css";

interface Props {
    tx: TransactionDoc;
    isPending: boolean;
    timestamp: number;
    address: string;
    networkId: NetworkId;
}
export default class AssetTxItem extends React.Component<Props, any> {
    public render() {
        const { tx, address, networkId, isPending, timestamp } = this.props;
        const assetHistory = TxUtil.getAggsAsset(address, tx);
        return _.map(assetHistory, (history, index) => (
            <div
                key={`${history.assetType}-${index}`}
                className="d-flex Asset-tx-item align-items-center"
            >
                <div className="date-container number">
                    <MediaQuery query="(max-width: 768px)">
                        {moment.unix(timestamp).format("MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                    <MediaQuery query="(min-width: 769px)">
                        {moment.unix(timestamp).format("YYYY-MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                </div>
                <div className="asset-info-container">
                    <div className="d-flex">
                        <ImageLoader
                            className="asset-image mr-2"
                            data={history.assetType}
                            size={18}
                            isAssetImage={true}
                            networkId={networkId}
                        />
                        <span className="asset-name">
                            {history.metadata.name || `0x${history.assetType}`}
                        </span>
                    </div>
                    <a
                        className="mono transaction-hash"
                        target="_blank"
                        href={`${getExplorerHost(networkId)}/tx/${tx.hash}`}
                    >
                        0x
                        {tx.hash}
                    </a>
                </div>
                <div className="balance-container number">
                    {this.renderQuantity(history)}
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">Pending</span>
                    ) : (
                        <span className="confirmed">Confirmed</span>
                    )}
                </div>
            </div>
        ));
    }

    private renderQuantity = (history: {
        assetType: string;
        inputQuantities: U64;
        outputQuantities: U64;
        burnQuantities: U64;
        metadata: Metadata.Metadata;
    }) => {
        const quantity = U64.minus(
            history.outputQuantities,
            U64.minus(history.inputQuantities, history.burnQuantities)
        );
        return `${quantity.gt(0) && "+"}${quantity.toString(10)}`;
    };
}
