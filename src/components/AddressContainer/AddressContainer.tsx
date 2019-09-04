import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import QRCode from "qrcode.react";
import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import MediaQuery from "react-responsive";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import copyBtnHover from "./img/copy-hover.svg";
import copyBtn from "./img/copy.svg";

import { Trans, withTranslation, WithTranslation } from "react-i18next";
import "./AddressContainer.css";

interface Props {
    address: string;
    backButtonPath: string;
    addressIndex?: number | null;
}

interface State {
    isCopyHovering: boolean;
}

class AddressContainer extends React.Component<Props & WithTranslation, State> {
    public constructor(props: Props & WithTranslation) {
        super(props);
        this.state = {
            isCopyHovering: false
        };
    }
    public render() {
        const { address, backButtonPath, addressIndex } = this.props;
        const { isCopyHovering } = this.state;
        return (
            <div className="Address-container d-flex align-items-center">
                <Link to={backButtonPath}>
                    <FontAwesomeIcon className="back-btn" icon="arrow-left" />
                </Link>
                <div className="qr-container">
                    <QRCode value={address} size={57} />
                </div>
                <div className="ml-3 name-address-container">
                    <h2 className="mb-0">
                        <Trans
                            i18nKey="main:address"
                            values={{
                                index:
                                    addressIndex != null ? addressIndex + 1 : ""
                            }}
                        />
                    </h2>
                    <span className="mono address-text mr-3">
                        <MediaQuery query="(max-width: 768px)">
                            {address.slice(0, 8)}
                            ...
                            {address.slice(address.length - 8, address.length)}
                        </MediaQuery>
                        <MediaQuery query="(min-width: 769px)">
                            {address}
                        </MediaQuery>
                    </span>
                    <CopyToClipboard
                        text={address}
                        onCopy={this.handleCopyAddress}
                    >
                        <img
                            className="copy-btn"
                            src={isCopyHovering ? copyBtnHover : copyBtn}
                            alt={"copy"}
                            onMouseOver={this.hoverCopyBtn}
                            onMouseOut={this.outCopyBtn}
                            onBlur={this.outCopyBtn}
                        />
                    </CopyToClipboard>
                </div>
            </div>
        );
    }

    private hoverCopyBtn = () => {
        this.setState({ isCopyHovering: true });
    };

    private outCopyBtn = () => {
        this.setState({ isCopyHovering: false });
    };

    private handleCopyAddress = () => {
        toast.info(this.props.t("main:copied"), {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 1000,
            closeButton: false,
            hideProgressBar: true
        });
    };
}

export default withTranslation()(AddressContainer);
