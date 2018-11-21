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
import { getPendingTransactions, getTxsByAddress } from "../../networks/Api";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/asset/actions";
import { getNetworkIdByAddress } from "../../utils/network";
import { TxUtil } from "../../utils/transaction";
import TxHistory from "../TxHistory/TxHistory";
import AssetItem from "./AssetItem/AssetItem";

interface OwnProps {
    match: match<{ address: string }>;
}

interface StateProps {
    addressUTXOList?: {
        data?: AggsUTXO[] | null;
        updatedAt?: number | null;
        isFetching: boolean;
    } | null;
}

interface DispatchProps {
    fetchAggsUTXOListIfNeed: (address: string) => void;
}

interface State {
    pendingTxList?: PendingTransactionDoc[] | null;
    unconfirmedTxList?: TransactionDoc[] | null;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetList extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            pendingTxList: undefined,
            unconfirmedTxList: undefined
        };
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
            this.setState({
                pendingTxList: undefined,
                unconfirmedTxList: undefined
            });
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
        const { addressUTXOList } = this.props;
        const { pendingTxList, unconfirmedTxList } = this.state;
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
        const { pendingTxList, unconfirmedTxList } = this.state;
        const { addressUTXOList } = this.props;

        if (!addressUTXOList || !pendingTxList || !unconfirmedTxList) {
            return [];
        }

        const aggregatedUnconfirmedAsset = _.flatMap(
            unconfirmedTxList,
            unconfirmedTx => {
                return TxUtil.getAssetHistoryFromTransaction(
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
                return TxUtil.getAssetHistoryFromTransaction(
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
        _.each(addressUTXOList.data, addressConfirmedUTXO => {
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
        this.getUnconfirmedTxList();
        this.getPendingTxList();
        this.props.fetchAggsUTXOListIfNeed(address);
    };

    private getPendingTxList = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
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

    private getUnconfirmedTxList = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        try {
            const unconfirmedTxList = await getTxsByAddress(
                address,
                true,
                1,
                10000,
                getNetworkIdByAddress(address)
            );
            this.setState({ unconfirmedTxList });
        } catch (e) {
            console.log(e);
        }
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const {
        match: {
            params: { address }
        }
    } = props;
    return {
        addressUTXOList: state.assetReducer.aggsUTXOList[address]
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAggsUTXOListIfNeed: (address: string) => {
        dispatch(actions.fetchAggsUTXOListIfNeed(address));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetList);
