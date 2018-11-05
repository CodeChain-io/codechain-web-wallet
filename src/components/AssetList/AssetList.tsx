import {
    AggsUTXO,
    PendingTransactionDoc,
    TransactionDoc
} from "codechain-indexer-types/lib/types";
import { MetadataFormat, Type } from "codechain-indexer-types/lib/utils";
import * as _ from "lodash";
import * as React from "react";
import { match } from "react-router";
import { Col, Container, Row } from "reactstrap";
import {
    getAggsUTXOList,
    getPendingTransactions,
    getTxsByAddress
} from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";
import { TxUtil } from "../../utils/transaction";
import TxHistory from "../TxHistory/TxHistory";
import AssetItem from "./AssetItem/AssetItem";

interface Props {
    match: match<{ address: string }>;
}

interface State {
    addressUTXOList?: AggsUTXO[] | null;
    pendingTxList?: PendingTransactionDoc[] | null;
    unconfirmedTxList?: TransactionDoc[] | null;
}

export default class AssetList extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            addressUTXOList: undefined,
            pendingTxList: undefined
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
                addressUTXOList: undefined,
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
        const {
            addressUTXOList,
            pendingTxList,
            unconfirmedTxList
        } = this.state;
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
        } = this.state;

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
        this.getAssetList();
        this.getUnconfirmedTxList();
        this.getPendingTxList();
    };

    private getAssetList = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        try {
            const UTXO = await getAggsUTXOList(
                address,
                getNetworkIdByAddress(address)
            );
            this.setState({ addressUTXOList: UTXO });
        } catch (e) {
            console.log(e);
        }
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
