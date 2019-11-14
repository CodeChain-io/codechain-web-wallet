import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionDoc } from "codechain-indexer-types";
import { H160 } from "codechain-sdk/lib/core/classes";
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
import { getIdByAddressAssetType } from "../../redux/chain/chainReducer";
import "./AssetTxHistory.css";
import AssetTxItem from "./AssetTxItem/AssetTxItem";
import Empty from "./img/cautiondisabled.svg";

interface OwnProps {
    address: string;
    assetType?: H160;
}

interface StateProps {
    pendingTxList?: TransactionDoc[] | null;
    txList?: TransactionDoc[] | null;
    networkId: NetworkId;
}

interface DispatchProps {
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchTxListIfNeed: (address: string, page: number) => void;
    fetchTxListByAssetTypeIfNeed: (
        address: string,
        assetType: H160,
        page: number
    ) => void;
}

interface State {
    activePage: number;
}

type Props = WithTranslation & StateProps & OwnProps & DispatchProps;

class AssetTxHistory extends React.Component<Props, State> {
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
                                <Trans i18nKey="send:asset.recent.empty" />
                            </div>
                        </div>
                    </div>
                )}
                {_.map(validPendingTxList, pendingTx => (
                    <AssetTxItem
                        key={pendingTx.hash}
                        tx={pendingTx}
                        address={address}
                        networkId={networkId}
                        isPending={true}
                        timestamp={pendingTx.pendingTimestamp!}
                    />
                ))}
                {_.map(txList, tx => (
                    <AssetTxItem
                        key={tx.hash}
                        tx={tx}
                        address={address}
                        networkId={networkId}
                        isPending={false}
                        timestamp={tx.timestamp!}
                    />
                ))}
                {(this.state.activePage > 1 || txList.length > 0) && (
                    <div className="pagination-container">
                        <Pagination
                            activePage={this.state.activePage}
                            itemsCountPerPage={10}
                            totalItemsCount={
                                (this.state.activePage - 1) * 10 +
                                (txList.length + 1)
                            }
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
        const {
            address,
            fetchTxListIfNeed,
            fetchTxListByAssetTypeIfNeed,
            assetType
        } = this.props;
        this.setState({ activePage: pageNumber });

        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType, pageNumber);
        } else {
            fetchTxListIfNeed(address, pageNumber);
        }
    };

    private init = async () => {
        this.fetchAll();
    };

    private fetchAll = () => {
        const {
            address,
            fetchPendingTxListIfNeed,
            fetchTxListIfNeed,
            assetType,
            fetchTxListByAssetTypeIfNeed
        } = this.props;
        const { activePage } = this.state;
        fetchPendingTxListIfNeed(address);

        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType, activePage);
        } else {
            fetchTxListIfNeed(address, activePage);
        }
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { address, assetType } = props;
    const pendingTxList = state.chainReducer.pendingTxList[address];
    const txList = assetType
        ? state.chainReducer.txListById[
              getIdByAddressAssetType(address, assetType)
          ]
        : state.chainReducer.txList[address];
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
    fetchTxListIfNeed: (address: string, page: number) => {
        dispatch(
            chainActions.fetchTxListIfNeed(address, {
                page,
                itemsPerPage: 10,
                force: true
            })
        );
    },
    fetchTxListByAssetTypeIfNeed: (
        address: string,
        assetType: H160,
        page: number
    ) => {
        dispatch(
            chainActions.fetchTxListByAssetTypeIfNeed(address, assetType, {
                page,
                itemsPerPage: 10,
                force: true
            })
        );
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(AssetTxHistory));
