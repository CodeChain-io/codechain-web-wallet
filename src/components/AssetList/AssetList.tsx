import * as _ from "lodash";
import * as React from "react";
import { match } from "react-router";
import { Col, Container, Row } from "reactstrap";
import { AddressUTXO } from "../../model/asset";
import { getUTXOList } from "../../networks/Api";
import AssetItem from "./AssetItem/AssetItem";

interface Props {
    match: match<{ address: string }>;
}

interface State {
    addressUTXOList?: AddressUTXO[];
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
                    <Container>Loading...</Container>
                </div>
            );
        }
        return (
            <div>
                <Container>
                    <h4>{address}</h4>
                    <Row>
                        {_.map(addressUTXOList, addressUTXO => (
                            <Col
                                xl={3}
                                lg={4}
                                sm={6}
                                key={addressUTXO.assetType}
                            >
                                <AssetItem addressUTXO={addressUTXO} />
                            </Col>
                        ))}
                    </Row>
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
            const UTXO = await getUTXOList(address);
            this.setState({ addressUTXOList: UTXO });
        } catch (e) {
            console.log(e);
        }
    };
}
