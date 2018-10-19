import * as _ from "lodash";
import * as React from "react";
import { match } from "react-router";
import { Col, Container, Row } from "reactstrap";
import { AggsUTXO } from "../../model/asset";
import { getAggsUTXOList } from "../../networks/Api";
import { getNetworkIdByAddress } from "../../utils/network";
import AssetItem from "./AssetItem/AssetItem";

interface Props {
    match: match<{ address: string }>;
}

interface State {
    addressUTXOList?: AggsUTXO[];
}

export default class AssetList extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            addressUTXOList: undefined
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
            this.setState({ addressUTXOList: undefined });
            this.getAssetList();
        }
    }

    public componentDidMount() {
        this.getAssetList();
    }

    public render() {
        const {
            match: {
                params: { address }
            }
        } = this.props;
        const { addressUTXOList } = this.state;
        if (!addressUTXOList) {
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
                            {addressUTXOList.length > 0 ? (
                                _.map(addressUTXOList, addressUTXO => (
                                    <Col
                                        xl={3}
                                        lg={4}
                                        sm={6}
                                        key={addressUTXO.assetType.value}
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
                                <div>Empty</div>
                            )}
                        </Row>
                    </div>
                </Container>
            </div>
        );
    }

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
}
