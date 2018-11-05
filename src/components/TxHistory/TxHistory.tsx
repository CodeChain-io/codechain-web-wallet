import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as React from "react";
import { Table } from "reactstrap";
import {
    getBestBlockNumber,
    getPendingTransactions,
    getTxsByAddress
} from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";
import PendingTxItem from "./PendingTxItem/PendingTxItem";
import TxItem from "./TxItem/TxItem";

interface Props {
    address: string;
}

interface State {
    pendingTxList?: PendingTransactionDoc[] | null;
    txList?: TransactionDoc[] | null;
    bestBlockNumber?: number | null;
}
export default class TxHistory extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            pendingTxList: undefined,
            txList: undefined,
            bestBlockNumber: undefined
        };
    }

    public componentDidMount() {
        this.getPendingTxList();
        this.getTxList();
        this.getBestBlockNumber();
    }

    public render() {
        const { address } = this.props;
        const { pendingTxList, txList, bestBlockNumber } = this.state;
        if (!pendingTxList || !txList || !bestBlockNumber) {
            return <div>Loading</div>;
        }
        const txHashList = _.map(txList, tx => tx.data.hash);
        const validPendingTxList = _.filter(
            pendingTxList,
            pendingTx =>
                !_.includes(txHashList, pendingTx.transaction.data.hash)
        );
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Hash</th>
                            <th>Quantities</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.map(validPendingTxList, (pendingTx, index) => (
                            <PendingTxItem
                                key={`${
                                    pendingTx.transaction.data.hash
                                }-${index}`}
                                pendingTx={pendingTx}
                                address={address}
                            />
                        ))}
                        {_.map(txList, (tx, index) => (
                            <TxItem
                                key={`${tx.data.hash}-${index}`}
                                tx={tx}
                                address={address}
                                bestBlockNumber={bestBlockNumber}
                            />
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }

    private getPendingTxList = async () => {
        const { address } = this.props;
        try {
            const pendingTxList = await getPendingTransactions(
                address,
                getNetworkIdByAddress(address)
            );
            this.setState({ pendingTxList });
        } catch (e) {
            console.log(e);
        }
    };

    private getTxList = async () => {
        const { address } = this.props;
        try {
            const txList = await getTxsByAddress(
                address,
                false,
                1,
                10,
                getNetworkIdByAddress(address)
            );
            this.setState({ txList });
        } catch (e) {
            console.log(e);
        }
    };

    private getBestBlockNumber = async () => {
        const { address } = this.props;
        try {
            const bestBlockNumber = await getBestBlockNumber(
                getNetworkIdByAddress(address)
            );
            this.setState({ bestBlockNumber });
        } catch (e) {
            console.log(e);
        }
    };
}
