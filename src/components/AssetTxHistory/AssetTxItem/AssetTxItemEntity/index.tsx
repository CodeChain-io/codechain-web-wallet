import { AssetSchemeDoc, TransactionDoc } from "codechain-indexer-types";
import { H160, U64 } from "codechain-sdk/lib/core/classes";
import moment from "moment";
import React from "react";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
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

type Props = OwnProps & StateProps & DispatchProps & WithTranslation;
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
            assetScheme,
            t
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
                        rel="noopener noreferrer"
                        href={`${getExplorerHost(networkId)}/tx/${tx.hash}`}
                    >
                        0x
                        {tx.hash}
                    </a>
                    {tx.type === "transferAsset" &&
                        tx.transferAsset.metadata &&
                        tx.transferAsset.metadata !== "" && (
                            <div className="memo-container">
                                <span className="memo-text">
                                    {t("main:memo")}:{" "}
                                    {tx.transferAsset.metadata}
                                </span>
                            </div>
                        )}
                </div>
                <div className="balance-container number">
                    {this.renderQuantity(history)}
                </div>
                <div className="status-container">
                    {isPending ? (
                        <span className="pending">
                            <Trans i18nKey="main:pending" />
                        </span>
                    ) : (
                        <span className="confirmed">
                            <Trans i18nKey="main:confirmed" />
                        </span>
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
)(withTranslation()(AssetTxItemEntity));
