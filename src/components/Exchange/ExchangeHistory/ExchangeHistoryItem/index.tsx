import { BigNumber } from "bignumber.js";
import * as React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import { NetworkId } from "../../../../model/address";
import { getExplorerHost } from "../../../../utils/network";
import "./index.css";

interface OwnProps {
    history: {
        received: {
            hash: string;
            quantity: string;
            status: "success" | "pending" | "reverted";
            confirm: number;
        };
        sent: {
            hash?: string;
            quantity: string;
            status: "success" | "pending";
        };
    };
    networkId: NetworkId;
}

type Props = OwnProps & WithTranslation;
class ExchangeHistoryItem extends React.Component<Props, any> {
    public render() {
        const { history, networkId } = this.props;
        return (
            <div className="Exchange-history-item">
                <div className="item-container received-container">
                    <div>
                        <span className="title-label">BTC</span>
                    </div>
                    <div>
                        {new BigNumber(history.received.quantity).toFormat()}{" "}
                        BTC
                    </div>
                    <div className="status-container">
                        <a
                            href={`https://blockexplorer.com/tx/${
                                history.received.hash
                            }`}
                            target="_blank"
                        >
                            <span
                                className={`tx-status ${
                                    history.received.status
                                }`}
                            >
                                {this.renderStatus(history.received.status)}
                            </span>
                        </a>
                    </div>
                </div>
                <div className="item-container sent-container">
                    <div>
                        <span className="title-label">CCC</span>
                    </div>
                    <div>
                        <div>
                            {new BigNumber(history.sent.quantity).toFormat()}{" "}
                            CCC
                        </div>
                        {history.sent.hash && (
                            <div className="status-container">
                                <a
                                    href={`${getExplorerHost(networkId)}/tx/${
                                        history.sent.hash
                                    }`}
                                    target="_blank"
                                >
                                    <span
                                        className={`tx-status ${
                                            history.sent.status
                                        }`}
                                    >
                                        {this.renderStatus(history.sent.status)}
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    private renderStatus = (
        status: "success" | "reverted" | "pending",
        confirm?: number
    ) => {
        if (status === "success") {
            return <Trans i18nKey="success" />;
        } else if (status === "pending" && confirm != null) {
            return (
                <Trans
                    i18nKey="confirm_left"
                    values={{
                        confirmCount: 2 - confirm,
                        isPlural: 2 - confirm >= 2 ? "s" : ""
                    }}
                />
            );
        } else if (status === "pending") {
            return <Trans i18nKey="pending" />;
        } else if (status === "reverted") {
            return <Trans i18nKey="reverted" />;
        }
        return null;
    };
}

export default withTranslation()(ExchangeHistoryItem);
