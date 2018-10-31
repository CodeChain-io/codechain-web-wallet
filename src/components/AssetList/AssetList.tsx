import {
    AggsUTXO,
    PendingTransactionDoc
} from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as React from "react";
import { match } from "react-router";
import { Col, Container, Row } from "reactstrap";
import { getAggsUTXOList, getPendingTransactions } from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";
import AssetItem from "./AssetItem/AssetItem";

interface Props {
    match: match<{ address: string }>;
}

interface State {
    addressConfirmedUTXOList?: AggsUTXO[] | null;
    pendingTxList?: PendingTransactionDoc[] | null;
}

export default class AssetList extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            addressConfirmedUTXOList: undefined,
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
                addressConfirmedUTXOList: undefined,
                pendingTxList: undefined
            });
            this.getConfirmedAssetList();
            this.getPendingTxList();
        }
    }

    public componentDidMount() {
        this.getConfirmedAssetList();
        this.getPendingTxList();
    }

    public render() {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const { addressConfirmedUTXOList, pendingTxList } = this.state;
        if (!addressConfirmedUTXOList || !pendingTxList) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
                </div>
            );
        }
        return (
            <div>
                <Container>
                    <div className="mt-5">
                        <h4>My assets</h4>
                        <hr />
                        <Row>
                            {addressConfirmedUTXOList.length > 0 ? (
                                _.map(addressConfirmedUTXOList, addressUTXO => (
                                    <Col
                                        xl={3}
                                        lg={4}
                                        sm={6}
                                        key={addressUTXO.assetType}
                                    >
                                        <AssetItem
                                            addressUTXO={addressUTXO}
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
                        <h4 className="mt-5">Pending data</h4>
                        <hr />
                        <div>{JSON.stringify(pendingTxList)}</div>
                    </div>
                </Container>
            </div>
        );
    }

    private getConfirmedAssetList = async () => {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        try {
            const UTXO = await getAggsUTXOList(
                address,
                true,
                getNetworkIdByAddress(address)
            );
            this.setState({ addressConfirmedUTXOList: UTXO });
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
}
