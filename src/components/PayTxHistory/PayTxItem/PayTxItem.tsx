import { TransactionDoc } from "codechain-indexer-types";
import { U64 } from "codechain-sdk/lib/core/classes";
import moment from "moment";
import React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { NetworkId } from "../../../model/address";
import { getExplorerHost } from "../../../utils/network";
import { TxUtil } from "../../../utils/transaction";
import "./PayTxItem.css";

interface Props {
    tx: TransactionDoc;
    isPending: boolean;
    timestamp: number;
    address: string;
    networkId: NetworkId;
}
class PayTxItem extends React.Component<Props & WithTranslation, any> {
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
                        rel="noopener noreferrer"
                        href={`${getExplorerHost(networkId)}/tx/${tx.hash}`}
                    >
                        0x
                        {tx.hash}
                    </a>
                </div>
                <div className="balance-container number">
                    <span>
                        {aggrTx.output.gte(aggrTx.input)
                            ? `+${U64.minus(
                                  aggrTx.output,
                                  aggrTx.input
                              ).toLocaleString()}`
                            : `-${U64.minus(
                                  aggrTx.input,
                                  aggrTx.output
                              ).toLocaleString()}`}{" "}
                        CCC
                    </span>
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">
                            <Trans i18nKey="main:pending" />
                        </span>
                    ) : (
                        <span className="confirmed">
                            <Trans i18nKey="main:confirmed" />
                        </span>
                    )}
                </div>
            </div>
        );
    }
}
export default withTranslation()(PayTxItem);
