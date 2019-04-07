import { BigNumber } from "bignumber.js";
import * as React from "react";
import "./index.css";

interface Props {
    history: {
        received: {
            hash: string;
            quantity: string;
            status: "success" | "pending" | "reverted";
        };
        sent?:
            | {
                  hash: string;
                  quantity: string;
                  status: "success" | "pending";
              }
            | undefined;
    };
}

export default class ExchangeHistoryItem extends React.Component<Props, any> {
    public render() {
        const { history } = this.props;
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
                    <div>{this.renderStatus(history.received.status)}</div>
                    <div className="tx-hash">
                        View:{" "}
                        <a
                            href={`https://tbtc.bitaps.com/${
                                history.received.hash
                            }`}
                            target="_blank"
                        >
                            {history.received.hash}
                        </a>
                    </div>
                </div>
                <div className="item-container sent-container">
                    <div>
                        <span className="title-label">CCC</span>
                    </div>
                    {history.sent ? (
                        <div>
                            <div>
                                {new BigNumber(
                                    history.sent.quantity
                                ).toFormat()}{" "}
                                CCC
                            </div>
                            <div>{this.renderStatus(history.sent.status)}</div>
                        </div>
                    ) : (
                        <div>
                            <span>...Waiting for deposit</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private renderStatus = (status: "success" | "pending" | "reverted") => {
        return <span className={`tx-status ${status}`}>{status}</span>;
    };
}
