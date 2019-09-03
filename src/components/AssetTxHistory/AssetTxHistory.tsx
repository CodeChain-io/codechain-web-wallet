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
    countOfTxList?: number | null;
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
    fetchCountOfTxListIfNeed: (address: string) => void;
    fetchCountOfTxListByAssetTypeIfNeed: (
        address: string,
        assetType: H160
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
                                <img src={Empty} />
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
            fetchTxListByAssetTypeIfNeed,
            fetchCountOfTxListIfNeed,
            fetchCountOfTxListByAssetTypeIfNeed
        } = this.props;
        const { activePage } = this.state;
        fetchPendingTxListIfNeed(address);

        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType, activePage);
            fetchCountOfTxListByAssetTypeIfNeed(address, assetType);
        } else {
            fetchTxListIfNeed(address, activePage);
            fetchCountOfTxListIfNeed(address);
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
    const countOfTxList = assetType
        ? state.chainReducer.countOfTxListById[
              getIdByAddressAssetType(address, assetType)
          ]
        : state.chainReducer.countOfTxList[address];
    const networkId = state.globalReducer.networkId;
    return {
        pendingTxList: pendingTxList && pendingTxList.data,
        txList: txList && txList.data,
        countOfTxList: countOfTxList && countOfTxList.data,
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
    },
    fetchCountOfTxListIfNeed: (address: string) => {
        dispatch(chainActions.fetchCountOfTxListIfNeed(address));
    },
    fetchCountOfTxListByAssetTypeIfNeed: (address: string, assetType: H160) => {
        dispatch(
            chainActions.fetchCountOfTxListByAssetTypeIfNeed(address, assetType)
        );
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(AssetTxHistory));
