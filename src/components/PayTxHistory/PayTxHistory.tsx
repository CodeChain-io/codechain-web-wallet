import { TransactionDoc } from "codechain-indexer-types";
import { H160 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import chainActions from "../../redux/chain/chainActions";
import * as Empty from "./img/cautiondisabled.svg";
import "./PayTxHistory.css";
import PayTxItem from "./PayTxItem/PayTxItem";

interface OwnProps {
    address: string;
}

interface StateProps {
    pendingTxList?: TransactionDoc[] | null;
    txList?: TransactionDoc[] | null;
    networkId: NetworkId;
}

interface DispatchProps {
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchTxListIfNeed: (address: string) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

class PayTxHistory extends React.Component<Props> {
    private refresher: any;
    public constructor(props: Props) {
        super(props);
        this.state = {
            pendingTxList: undefined,
            txList: undefined
        };
    }

    public componentDidMount() {
        this.init();
    }

    public componentWillUnmount() {
        this.clearInterval();
    }

    public render() {
        const { pendingTxList, txList, address, networkId } = this.props;
        if (!pendingTxList || !txList) {
            return <div>Loading...</div>;
        }
        const txHashList = _.map(txList, tx => tx.hash);
        const validPendingTxList = _.filter(
            pendingTxList,
            pendingTx => !_.includes(txHashList, pendingTx.hash)
        );
        return (
            <div className="Asset-tx-history">
                {validPendingTxList.length + txList.length === 0 && (
                    <div className="d-flex align-items-center justify-content-center">
                        <div>
                            <div className="text-center mt-3">
                                <img src={Empty} />
                            </div>
                            <div className="mt-3 empty">
                                There is no transaction
                            </div>
                        </div>
                    </div>
                )}
                {_.map(validPendingTxList, pendingTx => (
                    <PayTxItem
                        key={pendingTx.hash}
                        tx={pendingTx}
                        address={address}
                        networkId={networkId}
                        isPending={true}
                        timestamp={pendingTx.pendingTimestamp!}
                    />
                ))}
                {_.map(txList, tx => (
                    <PayTxItem
                        key={tx.hash}
                        tx={tx}
                        address={address}
                        networkId={networkId}
                        isPending={false}
                        timestamp={tx.timestamp!}
                    />
                ))}
            </div>
        );
    }

    private init = async () => {
        this.clearInterval();
        this.refresher = setInterval(() => {
            this.fetchAll();
        }, 5000);
        this.fetchAll();
    };

    private clearInterval = () => {
        if (this.refresher) {
            clearInterval(this.refresher);
        }
    };

    private fetchAll = () => {
        const {
            address,
            fetchPendingTxListIfNeed,
            fetchTxListIfNeed
        } = this.props;
        fetchPendingTxListIfNeed(address);
        fetchTxListIfNeed(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { address } = props;
    const pendingTxList = state.chainReducer.pendingTxList[address];
    const txList = state.chainReducer.txList[address];
    const networkId = state.globalReducer.networkId;
    return {
        pendingTxList: pendingTxList && pendingTxList.data,
        txList: txList && txList.data,
        networkId
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
    fetchTxListByAssetTypeIfNeed: (address: string, assetType: H160) => {
        dispatch(chainActions.fetchTxListByAssetTypeIfNeed(address, assetType));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PayTxHistory);
