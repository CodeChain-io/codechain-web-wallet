import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionDoc } from "codechain-indexer-types";
import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import chainActions from "../../redux/chain/chainActions";
import Empty from "./img/cautiondisabled.svg";
import "./PayTxHistory.css";
import PayTxItem from "./PayTxItem/PayTxItem";

interface OwnProps {
    address: string;
}

interface StateProps {
    pendingTxList?: TransactionDoc[] | null;
    txList?: TransactionDoc[] | null;
    hasNextPage?: boolean | null;
    hasPreviousPage?: boolean | null;
    lastEvaluatedKey?: string | null;
    firstEvaluatedKey?: string | null;
    networkId: NetworkId;
}

interface DispatchProps {
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchTxListIfNeed: (
        address: string,
        options?: {
            lastEvaluatedKey?: string | null;
            firstEvaluatedKey?: string | null;
        }
    ) => void;
}

type Props = WithTranslation & StateProps & OwnProps & DispatchProps;

class PayTxHistory extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public componentDidMount() {
        this.init();
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
                                <img src={Empty} alt={"empty"} />
                            </div>
                            <div className="mt-3 empty">
                                <Trans i18nKey="send:ccc.recent.empty" />
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
                {txList.length > 0 && (
                    <div className="pagination-container">
                        <ul className="pagination">
                            <li
                                className={`page-item ${
                                    !this.props.hasPreviousPage
                                        ? "disabled"
                                        : ""
                                }`}
                            >
                                <Link
                                    className="page-link"
                                    to="#"
                                    onClick={this.handlePreviousPage}
                                >
                                    <FontAwesomeIcon
                                        icon="angle-left"
                                        className="navigation-icon"
                                    />
                                </Link>
                            </li>
                            <li
                                className={`page-item ${
                                    !this.props.hasNextPage ? "disabled" : ""
                                }`}
                            >
                                <Link
                                    className="page-link"
                                    to="#"
                                    onClick={this.handleNextPage}
                                >
                                    <FontAwesomeIcon
                                        icon="angle-right"
                                        className="navigation-icon"
                                    />
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    private handleNextPage = () => {
        const { address, fetchTxListIfNeed, lastEvaluatedKey } = this.props;
        fetchTxListIfNeed(address, { lastEvaluatedKey });
    };

    private handlePreviousPage = () => {
        const { address, fetchTxListIfNeed, firstEvaluatedKey } = this.props;
        fetchTxListIfNeed(address, { firstEvaluatedKey });
    };

    private init = async () => {
        this.fetchAll();
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
        hasNextPage: txList && txList.hasNextPage,
        hasPreviousPage: txList && txList.hasPreviousPage,
        lastEvaluatedKey: txList && txList.lastEvaluatedKey,
        firstEvaluatedKey: txList && txList.firstEvaluatedKey,
        networkId
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchPendingTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchPendingTxListIfNeed(address));
    },
    fetchTxListIfNeed: (
        address: string,
        options?: {
            lastEvaluatedKey?: string | null;
            firstEvaluatedKey?: string | null;
        }
    ) => {
        dispatch(
            chainActions.fetchTxListIfNeed(address, {
                itemsPerPage: 10,
                force: true,
                ...options
            })
        );
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(PayTxHistory));
