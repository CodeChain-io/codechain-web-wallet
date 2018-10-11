import { BigNumber } from "bignumber.js";
import * as _ from "lodash";
import * as React from "react";
import { Col, Container, Row } from "reactstrap";
import { WalletAddress } from "../../model/address";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

const dummyAddresses: WalletAddress[] = [
    {
        name: "Dummy Asset Address",
        type: "Asset",
        totalAmount: new BigNumber(200),
        address: "tcaqyqur2tpam5wgcspdey5vdxvxf95xuxh46esn5m6s7"
    },
    {
        name: "Dummy Platform Address",
        type: "Platform",
        totalAmount: new BigNumber(20000000001),
        address: "tccq997hlvnq08ztal4a36adqt8ssugpdy8euxyakt2"
    }
];

export default class AddressList extends React.Component<{}, any> {
    public render() {
        return (
            <div className="Address-list">
                <Container>
                    <div className="mt-3">
                        <Row>
                            {_.map(
                                dummyAddresses,
                                (
                                    dummyAddress: WalletAddress,
                                    index: number
                                ) => (
                                    <Col xl={3} lg={4} sm={6} key={index}>
                                        <AddressItem address={dummyAddress} />
                                    </Col>
                                )
                            )}
                            <Col xl={3} lg={4} sm={6}>
                                <div className="add-address d-flex align-items-center justify-content-center">
                                    + Add address
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        );
    }
}
