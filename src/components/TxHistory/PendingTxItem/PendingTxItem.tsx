import { PendingTransactionDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import { TxUtil } from "../../../utils/transaction";

interface Props {
    address: string;
    pendingTx: PendingTransactionDoc;
}
export default class PendingTxItem extends React.Component<Props, any> {
    public render() {
        const { pendingTx, address } = this.props;
        const assetHistory = TxUtil.getAssetAggregationFromTransactionDoc(
            address,
            pendingTx.transaction
        );
        return _.map(assetHistory, history => (
            <tr>
                <td>{moment.unix(pendingTx.timestamp).fromNow()}</td>
                <td>{history.metadata.name || history.assetType}</td>
                <td>{pendingTx.transaction.data.hash}</td>
                <td>
                    {history.outputQuantities -
                        history.inputQuantities -
                        history.burnQuantities}
                </td>
                <td>Pending</td>
            </tr>
        ));
    }
}
