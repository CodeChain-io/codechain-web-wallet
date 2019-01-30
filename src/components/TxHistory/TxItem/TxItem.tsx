import { TransactionDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import MediaQuery from "react-responsive";
import { NetworkId } from "../../../model/address";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { getExplorerHost } from "../../../utils/network";
import { TxUtil } from "../../../utils/transaction";

import "./TxItem.css";

interface Props {
    tx: TransactionDoc;
    isPending: boolean;
    timestamp: number;
    address: string;
    networkId: NetworkId;
}
export default class TxItem extends React.Component<Props, any> {
    public render() {
        const { tx, address, networkId, isPending, timestamp } = this.props;
        const assetHistory = TxUtil.getAssetAggregationFromTransactionDoc(
            address,
            tx
        );
        return _.map(assetHistory, (history, index) => (
            <div
                key={`${history.assetType}-${index}`}
                className="d-flex Tx-item align-items-center"
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
                        href={`${getExplorerHost(networkId)}/tx/${
                            tx.data.hash
                        }`}
                    >
                        0x
                        {tx.data.hash}
                    </a>
                </div>
                <div className="balance-container number">
                    {history.outputQuantities -
                        history.inputQuantities -
                        history.burnQuantities >
                        0 && "+"}
                    {history.outputQuantities -
                        history.inputQuantities -
                        history.burnQuantities}
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">Pending</span>
                    ) : tx.data.invoice ? (
                        <span className="confirmed">Confirmed</span>
                    ) : (
                        <span className="failed">Failed</span>
                    )}
                </div>
            </div>
        ));
    }
}
