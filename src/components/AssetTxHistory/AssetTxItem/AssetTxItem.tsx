import { TransactionDoc } from "codechain-indexer-types";
import * as _ from "lodash";
import * as React from "react";
import { NetworkId } from "../../../model/address";
import { TxUtil } from "../../../utils/transaction";
import "./AssetTxItem.css";
import AssetTxItemEntity from "./AssetTxItemEntity";

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
            <AssetTxItemEntity
                key={`${history.assetType}-${index}`}
                tx={tx}
                history={history}
                index={index}
                timestamp={timestamp}
                isPending={isPending}
                networkId={networkId}
            />
        ));
    }
}
