import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionDoc } from "codechain-indexer-types";
import { H160 } from "codechain-sdk/lib/core/classes";
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
    fetchTxListByAssetTypeIfNeed: (
        address: string,
        assetType: H160,
        options?: {
            lastEvaluatedKey?: string | null;
            firstEvaluatedKey?: string | null;
        }
    ) => void;
}

type Props = WithTranslation & StateProps & OwnProps & DispatchProps;

class AssetTxHistory extends React.Component<Props> {
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
        const {
            address,
            fetchTxListIfNeed,
            fetchTxListByAssetTypeIfNeed,
            assetType,
            lastEvaluatedKey
        } = this.props;
        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType, {
                lastEvaluatedKey
            });
        } else {
            fetchTxListIfNeed(address, { lastEvaluatedKey });
        }
    };

    private handlePreviousPage = () => {
        const {
            address,
            fetchTxListIfNeed,
            fetchTxListByAssetTypeIfNeed,
            assetType,
            firstEvaluatedKey
        } = this.props;
        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType, {
                firstEvaluatedKey
            });
        } else {
            fetchTxListIfNeed(address, { firstEvaluatedKey });
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
        fetchPendingTxListIfNeed(address);

        if (assetType) {
            fetchTxListByAssetTypeIfNeed(address, assetType);
        } else {
            fetchTxListIfNeed(address);
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
    },
    fetchTxListByAssetTypeIfNeed: (
        address: string,
        assetType: H160,
        options?: {
            lastEvaluatedKey?: string | null;
            firstEvaluatedKey?: string | null;
        }
    ) => {
        dispatch(
            chainActions.fetchTxListByAssetTypeIfNeed(address, assetType, {
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
)(withTranslation()(AssetTxHistory));
