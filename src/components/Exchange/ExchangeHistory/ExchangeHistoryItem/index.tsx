import { BigNumber } from "bignumber.js";
import * as React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import { NetworkId } from "../../../../model/address";
import { getExplorerHost } from "../../../../utils/network";
import "./index.css";

interface OwnProps {
    selectedCurrency: "btc" | "eth";
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
        const { history, networkId, selectedCurrency } = this.props;
        return (
            <div className="Exchange-history-item">
                <div className="item-container received-container">
                    <div>
                        <span className="title-label">
                            {this.getLabel(selectedCurrency)}
                        </span>
                    </div>
                    <div>
                        {new BigNumber(history.received.quantity).toFormat()}{" "}
                        {this.getLabel(selectedCurrency)}
                    </div>
                    <div className="status-container">
                        <a
                            href={`${this.getExplorer(selectedCurrency)}${
                                history.received.hash
                            }`}
                            target="_blank"
                        >
                            <span
                                className={`tx-status ${
                                    history.received.status
                                }`}
                            >
                                {this.renderStatus(
                                    history.received.status,
                                    history.received.confirm
                                )}
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
    private getExplorer = (currency: "btc" | "eth") => {
        if (currency === "btc") {
            return "https://blockexplorer.com/tx/";
        } else if (currency === "eth") {
            return "https://etherscan.io/tx/";
        }
        return "";
    };
    private getLabel = (currency: "btc" | "eth") => {
        if (currency === "btc") {
            return "BTC";
        } else if (currency === "eth") {
            return "ETH";
        }
        return "";
    };
    private renderStatus = (
        status: "success" | "reverted" | "pending",
        confirm?: number
    ) => {
        const { selectedCurrency } = this.props;
        const confirmCount = selectedCurrency === "btc" ? 2 : 44;
        if (status === "success") {
            return <Trans i18nKey="charge:exchange_state.success" />;
        } else if (status === "pending" && confirm != null) {
            return (
                <Trans
                    i18nKey="charge:exchange_state.confirm_left"
                    values={{
                        confirmCount: confirmCount - confirm,
                        isPlural: confirmCount - confirm >= 2 ? "s" : ""
                    }}
                />
            );
        } else if (status === "pending") {
            return <Trans i18nKey="charge:exchange_state.pending" />;
        } else if (status === "reverted") {
            return <Trans i18nKey="charge:exchange_state.reverted" />;
        }
        return null;
    };
}

export default withTranslation()(ExchangeHistoryItem);
