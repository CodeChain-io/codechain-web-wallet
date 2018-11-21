import {
    AggsUTXO,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Col, Container, Row } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../redux";
import assetActions from "../../redux/asset/assetActions";
import transactionActions from "../../redux/transaction/transactionActions";
import { getNetworkIdByAddress } from "../../utils/network";
import { TxUtil } from "../../utils/transaction";
import TxHistory from "../TxHistory/TxHistory";
import AssetItem from "./AssetItem/AssetItem";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    addressUTXOList?: AggsUTXO[] | null;
    pendingTxList?: PendingTransactionDoc[] | null;
    unconfirmedTxList?: TransactionDoc[] | null;
}

interface DispatchProps {
    fetchAggsUTXOListIfNeed: (address: string) => void;
    fetchPendingTxListIfNeed: (address: string) => void;
    fetchUnconfirmedTxListIfNeed: (address: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetList extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
    }
    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            match: {
                params: { address: nextAddress }
            }
        } = props;
        if (nextAddress !== address) {
            this.init();
        }
    }

    public componentDidMount() {
        this.init();
    }

    public render() {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            addressUTXOList,
            pendingTxList,
            unconfirmedTxList
        } = this.props;
        if (!addressUTXOList || !pendingTxList || !unconfirmedTxList) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
                </div>
            );
        }
        const availableAssets = this.getAvailableAssets();
        return (
            <div>
                <Container>
                    <div className="mt-5">
                        <h4>My assets</h4>
                        <hr />
                        <Row>
                            {availableAssets.length > 0 ? (
                                _.map(availableAssets, availableAsset => (
                                    <Col
                                        xl={3}
                                        lg={4}
                                        sm={6}
                                        key={availableAsset.assetType}
                                    >
                                        <AssetItem
                                            assetType={availableAsset.assetType}
                                            quantities={
                                                availableAsset.quantities
                                            }
                                            metadata={availableAsset.metadata}
                                            networkId={getNetworkIdByAddress(
                                                address
                                            )}
                                            address={address}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <Col>Empty</Col>
                            )}
                        </Row>
                        <h4 className="mt-5">History</h4>
                        <TxHistory address={address} />
                    </div>
                </Container>
            </div>
        );
    }

    private getAvailableAssets = () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const {
            addressUTXOList,
            pendingTxList,
            unconfirmedTxList
        } = this.props;

        if (!addressUTXOList || !pendingTxList || !unconfirmedTxList) {
            return [];
        }

        const aggregatedUnconfirmedAsset = _.flatMap(
            unconfirmedTxList,
            unconfirmedTx => {
                return TxUtil.getAssetAggregationFromTransactionDoc(
                    address,
                    unconfirmedTx
                );
            }
        );

        const txHashList = _.map(unconfirmedTxList, tx => tx.data.hash);
        const validPendingTxList = _.filter(
            pendingTxList,
            pendingTx =>
                !_.includes(txHashList, pendingTx.transaction.data.hash)
        );
        const aggregatedPendingAsset = _.flatMap(
            validPendingTxList,
            pendingTx => {
                return TxUtil.getAssetAggregationFromTransactionDoc(
                    address,
                    pendingTx.transaction
                );
            }
        );

        const availableAssets: {
            [assetType: string]: {
                assetType: string;
                quantities: number;
                metadata: MetadataFormat;
            };
        } = {};
        _.each(addressUTXOList, addressConfirmedUTXO => {
            availableAssets[addressConfirmedUTXO.assetType] = {
                assetType: addressConfirmedUTXO.assetType,
                quantities: addressConfirmedUTXO.totalAssetQuantity,
                metadata: Type.getMetadata(
                    addressConfirmedUTXO.assetScheme.metadata
                )
            };
        });
        _.each(aggregatedUnconfirmedAsset, asset => {
            const quantities =
                asset.outputQuantities -
                (asset.inputQuantities + asset.burnQuantities);

            if (quantities > 0) {
                availableAssets[asset.assetType] = {
                    ...availableAssets[asset.assetType],
                    quantities:
                        availableAssets[asset.assetType].quantities - quantities
                };
            }
        });
        _.each(aggregatedPendingAsset, asset => {
            const quantities =
                asset.outputQuantities -
                (asset.inputQuantities + asset.burnQuantities);

            if (quantities < 0) {
                availableAssets[asset.assetType] = {
                    ...availableAssets[asset.assetType],
                    quantities:
                        availableAssets[asset.assetType].quantities + quantities
                };
            }
        });
        return _.values(availableAssets);
    };

    private init = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        this.props.fetchUnconfirmedTxListIfNeed(address);
        this.props.fetchPendingTxListIfNeed(address);
        this.props.fetchAggsUTXOListIfNeed(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    const aggsUTXOList = state.assetReducer.aggsUTXOList[address];
    const pendingTxList = state.transactionReducer.pendingTxList[address];
    const unconfirmedTxList =
        state.transactionReducer.unconfirmedTxList[address];
    return {
        addressUTXOList: aggsUTXOList && aggsUTXOList.data,
        pendingTxList: pendingTxList && pendingTxList.data,
        unconfirmedTxList: unconfirmedTxList && unconfirmedTxList.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAggsUTXOListIfNeed: (address: string) => {
        dispatch(assetActions.fetchAggsUTXOListIfNeed(address));
    },
    fetchPendingTxListIfNeed: (address: string) => {
        dispatch(transactionActions.fetchPendingTxListIfNeed(address));
    },
    fetchUnconfirmedTxListIfNeed: (address: string) => {
        dispatch(transactionActions.fetchUnconfirmedTxListIfNeed(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetList);
