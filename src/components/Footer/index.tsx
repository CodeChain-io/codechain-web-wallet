import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Col, Container, Row } from "reactstrap";
import facebook from "./img/facebook.svg";
import github from "./img/github.svg";
import gitter from "./img/gitter.svg";
import medium from "./img/medium.svg";
import telegram from "./img/telegram.svg";
import twitter from "./img/twitter.svg";
import "./index.css";

type Props = WithTranslation;

class Footer extends React.Component<Props> {
    public render() {
        return (
            <div className="Footer">
                <Container>
                    <Row>
                        <Col lg={6} className="left-panel">
                            <ul className="left-menu-list list-inline list-unstyled">
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://codechain.io"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://codechain.io/#contact"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://docs.google.com/document/d/13Bonpgp2Va4dDlAIzvH2JSKFyOBlSSUrvFQ_PE2YqWI/edit?usp=sharing"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://docs.google.com/document/d/1-HJep6vXMaiX4p62ijIfAc9yyX_rKAFkFLPsMod8tl0/edit?usp=sharing"
                                    >
                                        Terms and Conditions
                                    </a>
                                </li>
                            </ul>
                        </Col>
                        <Col lg={6} className="right-panel">
                            <ul className="right-menu-list list-unstyled list-unstyled">
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://www.facebook.com/codechain/"
                                    >
                                        <img src={facebook} alt={"facebook"} />
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://github.com/CodeChain-io/codechain-web-wallet"
                                    >
                                        <img src={github} alt={"github"} />
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://gitter.im/CodeChain-io/codechain"
                                    >
                                        <img src={gitter} alt={"gitter"} />
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://twitter.com/codechain_io"
                                    >
                                        <img src={twitter} alt={"twitter"} />
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://medium.com/codechain"
                                    >
                                        <img src={medium} alt={"medium"} />
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="http://t.me/codechain_protocol"
                                    >
                                        <img src={telegram} alt={"telegram"} />
                                    </a>
                                </li>
                                <li className="list-inline-item language-selector-container">
                                    <select
                                        onChange={this.onLanguageChange}
                                        className="language-selector"
                                        value={this.props.i18n.language}
                                        defaultValue="en"
                                    >
                                        <option value="en">English</option>
                                        <option value="ko">한국어</option>
                                    </select>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    public onLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = event.target.value;
        this.props.i18n.changeLanguage(lang);
    };
}

export default withTranslation()(Footer);
