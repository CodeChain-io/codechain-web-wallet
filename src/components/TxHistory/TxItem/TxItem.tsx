import { TransactionDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as React from "react";
import { TxUtil } from "../../../utils/transaction";

interface Props {
    tx: TransactionDoc;
    address: string;
    bestBlockNumber: number;
}
export default class TxItem extends React.Component<Props, any> {
    public render() {
        const { tx, address, bestBlockNumber } = this.props;
        const assetHistory = TxUtil.getAssetHistoryFromTransaction(address, tx);
        const confirmNumber = bestBlockNumber - tx.data.blockNumber;
        return _.map(assetHistory, (history, index) => (
            <tr key={`${history.assetType}-${index}`}>
                <td>{history.metadata.name || history.assetType}</td>
                <td>{tx.data.hash}</td>
                <td>
                    {history.outputQuantities -
                        history.inputQuantities -
                        history.burnQuantities >
                        0 && "+"}
                    {history.outputQuantities -
                        history.inputQuantities -
                        history.burnQuantities}
                </td>
                <td>
                    {confirmNumber > 5
                        ? `5+ Confrimed`
                        : `${confirmNumber} Confirming`}
                </td>
            </tr>
        ));
    }
}
