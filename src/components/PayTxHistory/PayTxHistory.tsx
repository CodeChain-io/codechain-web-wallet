import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionDoc } from "codechain-indexer-types";
import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
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
    countOfTxList?: number | null;
    networkId: NetworkId;
}

interface State {
    activePage: number;
}

interface DispatchProps {
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchTxListIfNeed: (address: string, page: number) => void;
    fetchCountOfTxListIfNeed: (address: string) => void;
}

type Props = WithTranslation & StateProps & OwnProps & DispatchProps;

class PayTxHistory extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            activePage: 1
        };
    }

    public componentDidMount() {
        this.init();
    }

    public render() {
        const {
            pendingTxList,
            txList,
            address,
            networkId,
            countOfTxList
        } = this.props;
        if (!pendingTxList || !txList || countOfTxList == null) {
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
                {countOfTxList > 0 && (
                    <div className="pagination-container">
                        <Pagination
                            activePage={this.state.activePage}
                            itemsCountPerPage={10}
                            totalItemsCount={countOfTxList}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange}
                            itemClass="page-item"
                            linkClass="page-link"
                            prevPageText={
                                <FontAwesomeIcon
                                    icon="angle-left"
                                    className="navigation-icon"
                                />
                            }
                            nextPageText={
                                <FontAwesomeIcon
                                    icon="angle-right"
                                    className="navigation-icon"
                                />
                            }
                            firstPageText={
                                <FontAwesomeIcon
                                    icon="angle-double-left"
                                    className="navigation-icon"
                                />
                            }
                            lastPageText={
                                <FontAwesomeIcon
                                    icon="angle-double-right"
                                    className="navigation-icon"
                                />
                            }
                        />
                    </div>
                )}
            </div>
        );
    }
    private handlePageChange = (pageNumber: number) => {
        const { address, fetchTxListIfNeed } = this.props;
        this.setState({ activePage: pageNumber });
        fetchTxListIfNeed(address, pageNumber);
    };

    private init = async () => {
        this.fetchAll();
    };

    private fetchAll = () => {
        const {
            address,
            fetchPendingTxListIfNeed,
            fetchTxListIfNeed,
            fetchCountOfTxListIfNeed
        } = this.props;
        const { activePage } = this.state;
        fetchPendingTxListIfNeed(address);
        fetchTxListIfNeed(address, activePage);
        fetchCountOfTxListIfNeed(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { address } = props;
    const pendingTxList = state.chainReducer.pendingTxList[address];
    const txList = state.chainReducer.txList[address];
    const countOfTxList = state.chainReducer.countOfTxList[address];
    const networkId = state.globalReducer.networkId;
    return {
        pendingTxList: pendingTxList && pendingTxList.data,
        countOfTxList: countOfTxList && countOfTxList.data,
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
    fetchTxListIfNeed: (address: string, page: number) => {
        dispatch(
            chainActions.fetchTxListIfNeed(address, {
                page,
                itemsPerPage: 10,
                force: true
            })
        );
    },
    fetchCountOfTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchCountOfTxListIfNeed(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(PayTxHistory));
