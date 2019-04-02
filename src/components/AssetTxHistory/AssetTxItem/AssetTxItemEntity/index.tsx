import { AssetSchemeDoc, TransactionDoc } from "codechain-indexer-types";
import { H160, U64 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import MediaQuery from "react-responsive";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../../model/address";
import { ReducerConfigure } from "../../../../redux";
import assetActions from "../../../../redux/asset/assetActions";
import { ImageLoader } from "../../../../utils/ImageLoader/ImageLoader";
import { parseMetadata } from "../../../../utils/metadata";
import { getExplorerHost } from "../../../../utils/network";

interface OwnProps {
    index: number;
    timestamp: number;
    networkId: NetworkId;
    tx: TransactionDoc;
    isPending: boolean;
    history: {
        assetType: string;
        inputQuantities: U64;
        outputQuantities: U64;
        burnQuantities: U64;
    };
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H160) => void;
}

type Props = OwnProps & StateProps & DispatchProps;
class AssetTxItemEntity extends React.Component<Props, any> {
    public componentDidMount() {
        this.props.fetchAssetSchemeIfNeed(
            new H160(this.props.history.assetType)
        );
    }
    public render() {
        const {
            history,
            timestamp,
            networkId,
            tx,
            isPending,
            assetScheme
        } = this.props;

        let metadata;
        if (assetScheme) {
            metadata = parseMetadata(assetScheme.metadata);
        }
        return (
            <div className="d-flex Asset-tx-item align-items-center">
                <div className="date-container number">
                    <MediaQuery query="(max-width: 768px)">
                        {moment.unix(timestamp).format("MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                    <MediaQuery query="(min-width: 769px)">
                        {moment.unix(timestamp).format("YYYY-MM-DD[\r\n]HH:mm")}
                    </MediaQuery>
                </div>
                <div className="asset-info-container">
                    <div className="d-flex">
                        <ImageLoader
                            className="asset-image mr-2"
                            data={history.assetType}
                            size={18}
                            isAssetImage={true}
                            networkId={networkId}
                        />
                        <span className="asset-name">
                            {(metadata && metadata.name) ||
                                `0x${history.assetType}`}
                        </span>
                    </div>
                    <a
                        className="mono transaction-hash"
                        target="_blank"
                        href={`${getExplorerHost(networkId)}/tx/${tx.hash}`}
                    >
                        0x
                        {tx.hash}
                    </a>
                </div>
                <div className="balance-container number">
                    {this.renderQuantity(history)}
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">Pending</span>
                    ) : (
                        <span className="confirmed">Confirmed</span>
                    )}
                </div>
            </div>
        );
    }

    private renderQuantity = (history: {
        assetType: string;
        inputQuantities: U64;
        outputQuantities: U64;
        burnQuantities: U64;
    }) => {
        if (
            history.outputQuantities.gt(
                U64.plus(history.inputQuantities, history.burnQuantities)
            )
        ) {
            const quantity = U64.minus(
                history.outputQuantities,
                U64.plus(history.inputQuantities, history.burnQuantities)
            );
            return `+${quantity.toLocaleString()}`;
        } else {
            const quantity = U64.minus(
                U64.plus(history.inputQuantities, history.burnQuantities),
                history.outputQuantities
            );
            return `-${quantity.toLocaleString()}`;
        }
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const assetScheme =
        state.assetReducer.assetScheme[ownProps.history.assetType];
    return {
        assetScheme: assetScheme && assetScheme.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAssetSchemeIfNeed: (assetType: H160) => {
        dispatch(assetActions.fetchAssetSchemeIfNeed(assetType));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetTxItemEntity);
