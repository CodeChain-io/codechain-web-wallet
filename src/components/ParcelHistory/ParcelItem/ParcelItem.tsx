import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ParcelDoc } from "codechain-indexer-types/lib/types";
import { U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import MediaQuery from "react-responsive";
import { NetworkId } from "../../../model/address";
import { getExplorerHost } from "../../../utils/network";
import { getAggrPaymentParcel } from "../../../utils/parcel";
import { changeQuarkToCCCString } from "../../../utils/unit";
import "./ParcelItem.css";

interface Props {
    parcel: ParcelDoc;
    isPending: boolean;
    timestamp: number;
    address: string;
    bestBlockNumber: number;
    networkId: NetworkId;
}
export default class ParcelItem extends React.Component<Props, any> {
    public render() {
        const {
            parcel,
            address,
            bestBlockNumber,
            networkId,
            isPending,
            timestamp
        } = this.props;
        const aggrParcel = getAggrPaymentParcel(address, [parcel]);
        const confirmNumber = bestBlockNumber - (parcel.blockNumber || 0);
        const isSender = parcel.signer === address;
        return (
            <div className="d-flex Parcel-item align-items-center">
                <div className="date-container number">
                    <MediaQuery query="(max-width: 768px)">
                        {moment.unix(timestamp).format("MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                    <MediaQuery query="(min-width: 769px)">
                        {moment.unix(timestamp).format("YYYY-MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                </div>
                <div className="asset-info-container">
                    <a
                        className="mono parcel-hash"
                        target="_blank"
                        href={`${getExplorerHost(networkId)}/parcel/${
                            parcel.hash
                        }`}
                    >
                        0x
                        {parcel.hash}
                    </a>
                </div>
                <div className="balance-container number">
                    {isSender ? (
                        <span>
                            {aggrParcel.output
                                .minus(aggrParcel.input)
                                .minus(parcel.fee)
                                .comparedTo(0) === 1
                                ? "+"
                                : "-"}
                            {changeQuarkToCCCString(
                                new U256(
                                    aggrParcel.output
                                        .minus(aggrParcel.input)
                                        .minus(parcel.fee)
                                        .abs()
                                )
                            )}
                            CCC
                        </span>
                    ) : (
                        <span>
                            {aggrParcel.output
                                .minus(aggrParcel.input)
                                .comparedTo(0) === 1
                                ? "+"
                                : "-"}
                            {changeQuarkToCCCString(
                                new U256(
                                    aggrParcel.output
                                        .minus(aggrParcel.input)
                                        .abs()
                                )
                            )}
                            CCC
                        </span>
                    )}
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">pending...</span>
                    ) : confirmNumber > 5 ? (
                        <span className="confirmed">confrimed</span>
                    ) : (
                        <div className="text-center confirming">
                            <p className="mb-0">confirming</p>
                            {_.map(_.range(6), num => {
                                return (
                                    <FontAwesomeIcon
                                        key={num}
                                        className={`${num <= confirmNumber &&
                                            "circle-confirmed"} circle-icon`}
                                        icon="circle"
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
