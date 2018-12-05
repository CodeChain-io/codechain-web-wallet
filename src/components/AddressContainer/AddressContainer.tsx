import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as QRCode from "qrcode.react";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import MediaQuery from "react-responsive";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import * as copyBtnHover from "./img/copy-hover.svg";
import * as copyBtn from "./img/copy.svg";

import "./AddressContainer.css";

interface Props {
    address: string;
    backButtonPath: string;
    addressName?: string | null;
}

interface State {
    isCopyHovering: boolean;
}

class AddressContainer extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            isCopyHovering: false
        };
    }
    public render() {
        const { address, backButtonPath, addressName } = this.props;
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
                    <h2 className="mb-0">{addressName}</h2>
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
        toast.info("Copied!", {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 3000
        });
    };
}

export default AddressContainer;
