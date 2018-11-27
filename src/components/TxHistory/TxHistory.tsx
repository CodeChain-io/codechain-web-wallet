import {
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../redux";
import chainActions from "../../redux/chain/chainActions";
import PendingTxItem from "./PendingTxItem/PendingTxItem";
import TxItem from "./TxItem/TxItem";

interface OwnProps {
    address: string;
}

interface StateProps {
    pendingTxList?: PendingTransactionDoc[] | null;
    txList?: TransactionDoc[] | null;
    bestBlockNumber?: number | null;
}

interface DispatchProps {
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchTxListIfNeed: (address: string) => void;
    fetchBestBlockNumberIfNeed: () => void;
}

type Props = StateProps & OwnProps & DispatchProps;

class TxHistory extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            pendingTxList: undefined,
            txList: undefined,
            bestBlockNumber: undefined
        };
    }

    public componentDidMount() {
        const {
            address,
            fetchBestBlockNumberIfNeed,
            fetchPendingTxListIfNeed,
            fetchTxListIfNeed
        } = this.props;
        fetchBestBlockNumberIfNeed();
        fetchPendingTxListIfNeed(address);
        fetchTxListIfNeed(address);
    }

    public render() {
        const { pendingTxList, txList, bestBlockNumber, address } = this.props;
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
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { address } = props;
    const pendingTxList = state.chainReducer.pendingTxList[address];
    const txList = state.chainReducer.txList[address];
    const bestBlockNumber = state.chainReducer.bestBlockNumber;
    return {
        pendingTxList: pendingTxList && pendingTxList.data,
        txList: txList && txList.data,
        bestBlockNumber: bestBlockNumber && bestBlockNumber.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchPendingTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchPendingTxListIfNeed(address));
    },
    fetchTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchTxListIfNeed(address));
    },
    fetchBestBlockNumberIfNeed: () => {
        dispatch(chainActions.fetchBestBlockNumberIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TxHistory);
