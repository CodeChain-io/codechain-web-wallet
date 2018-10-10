import * as React from "react";
import { Col, Container, Row } from "reactstrap";
import AddressItem from "./AddressItem/AddressItem";
import "./AddressList.css";

export default class AddressList extends React.Component<{}, any> {
    public render() {
        return (
            <div className="Address-list">
                <Container>
                    <div className="mt-3">
                        <Row>
                            <Col xl={3} lg={4} sm={6}>
                                <AddressItem />
                            </Col>
                            <Col xl={3} lg={4} sm={6}>
                                <AddressItem />
                            </Col>
                            <Col xl={3} lg={4} sm={6}>
                                <AddressItem />
                            </Col>
                            <Col xl={3} lg={4} sm={6}>
                                <AddressItem />
                            </Col>
                            <Col xl={3} lg={4} sm={6}>
                                <AddressItem />
                            </Col>
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
