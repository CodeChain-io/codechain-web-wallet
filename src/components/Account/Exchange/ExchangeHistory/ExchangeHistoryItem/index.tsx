import { BigNumber } from "bignumber.js";
import * as React from "react";
import { NetworkId } from "../../../../../model/address";
import { getExplorerHost } from "../../../../../utils/network";
import "./index.css";

interface Props {
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

export default class ExchangeHistoryItem extends React.Component<Props, any> {
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
                                {history.received.status === "pending"
                                    ? `${2 - history.received.confirm} confirm${
                                          2 - history.received.confirm >= 2
                                              ? "s"
                                              : ""
                                      } left`
                                    : history.received.status}
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
                                        {history.sent.status}
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
