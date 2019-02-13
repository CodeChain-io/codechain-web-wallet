import { TransactionDoc } from "codechain-indexer-types";
import { U64 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import MediaQuery from "react-responsive";
import { NetworkId } from "../../../model/address";
import { getExplorerHost } from "../../../utils/network";
import { TxUtil } from "../../../utils/transaction";
import { changeQuarkToCCCString } from "../../../utils/unit";
import "./PayTxItem.css";

interface Props {
    tx: TransactionDoc;
    isPending: boolean;
    timestamp: number;
    address: string;
    networkId: NetworkId;
}
export default class PayTxItem extends React.Component<Props, any> {
    public render() {
        const { tx, address, networkId, isPending, timestamp } = this.props;
        const aggrTx = TxUtil.getAggsQuark(address, [tx]);
        return (
            <div className="d-flex Pay-tx-item align-items-center">
                <div className="date-container number">
                    <MediaQuery query="(max-width: 768px)">
                        {moment.unix(timestamp).format("MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                    <MediaQuery query="(min-width: 769px)">
                        {moment.unix(timestamp).format("YYYY-MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                </div>
                <div className="pay-info-container">
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
                    <span>
                        {aggrTx.output.gte(aggrTx.input)
                            ? `+${changeQuarkToCCCString(
                                  U64.minus(aggrTx.output, aggrTx.input)
                              )}`
                            : `-${changeQuarkToCCCString(
                                  U64.minus(aggrTx.input, aggrTx.output)
                              )}`}{" "}
                        CCC
                    </span>
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">Pending</span>
                    ) : tx.invoice ? (
                        <span className="confirmed">Confirmed</span>
                    ) : (
                        <span className="failed">Failed</span>
                    )}
                </div>
            </div>
        );
    }
}
