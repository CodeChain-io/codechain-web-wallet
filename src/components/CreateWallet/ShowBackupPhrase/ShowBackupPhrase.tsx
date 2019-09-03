import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./ShowBackupPhrase.css";

interface OwnProps {
    onSubmit: () => void;
    mnemonic: string[];
}
type Props = WithTranslation & OwnProps;

class ShowBackupPhrase extends React.Component<Props> {
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        const { mnemonic } = this.props;
        return (
            <div className="Show-backup-phrase animated fadeIn">
                <div className="title-container">
                    <h4 className="title">
                        <Trans i18nKey="create:mnemonic.title" />
                    </h4>
                </div>
                <div className="text-1">
                    <Trans i18nKey="create:mnemonic.detail" />
                </div>
                <div className="warning-text">
                    <Trans i18nKey="create:mnemonic.warning" />
                </div>
                <div className="tips-container">
                    <p className="tips-text mb-0">
                        <Trans i18nKey="create:mnemonic.tip" />
                    </p>
                    <span className="text-2">
                        <Trans i18nKey="create:mnemonic.tip_detail" />
                    </span>
                </div>
                <div className="backup-phrase-container">
                    <div className="backup-phrase-panel d-flex align-items-center justify-content-center">
                        <span>{mnemonic.join(" ")}</span>
                        <CopyToClipboard
                            text={mnemonic.join(" ")}
                            onCopy={this.handleCopyPhrase}
                        >
                            <div className="copy-btn">
                                <span>
                                    <Trans i18nKey="create:mnemonic.copy" />
                                </span>
                            </div>
                        </CopyToClipboard>
                    </div>
                </div>
                <div>
                    <button
                        className="btn btn-primary reverse square main-btn"
                        type="submit"
                        onClick={this.props.onSubmit}
                    >
                        <Trans i18nKey="create:mnemonic.button" />
                    </button>
                </div>
            </div>
        );
    }

    private handleCopyPhrase = () => {
        toast.info(this.props.t("create:mnemonic.copied"), {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 1000,
            closeButton: false,
            hideProgressBar: true
        });
    };
}

export default withTranslation()(ShowBackupPhrase);
