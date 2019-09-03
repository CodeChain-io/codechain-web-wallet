import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AssetSchemeDoc } from "codechain-indexer-types";
import { H160, U64 } from "codechain-sdk/lib/core/classes";
import React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import assetActions from "../../../redux/asset/assetActions";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { parseMetadata } from "../../../utils/metadata";
import "./AssetItem.css";

interface OwnProps {
    assetType: string;
    quantities: U64;
    networkId: NetworkId;
    address: string;

    isSelected: boolean;
    onSelect: (assetType: string) => void;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H160) => void;
}

type Props = RouteComponentProps & OwnProps & StateProps & DispatchProps;

class AssetItem extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public componentDidMount() {
        this.props.fetchAssetSchemeIfNeed(new H160(this.props.assetType));
    }
    public render() {
        const {
            assetType,
            quantities,
            networkId,
            isSelected,
            assetScheme
        } = this.props;
        let metadata;
        if (assetScheme) {
            metadata = parseMetadata(assetScheme.metadata);
        }
        return (
            <div
                onClick={this.handleClick}
                className={`Asset-item animated-fadeIn ${isSelected &&
                    "selected"}`}
            >
                <div className="d-flex align-items-center">
                    <div className="image-container">
                        <ImageLoader
                            data={assetType}
                            size={48}
                            isAssetImage={true}
                            networkId={networkId}
                        />
                    </div>
                    <div className="name-container">
                        <span className="mb-0 asset-name">
                            {(metadata && metadata.name) ||
                                `...${assetType.slice(
                                    assetType.length - 8,
                                    assetType.length
                                )}`}
                        </span>
                    </div>
                    <span className="mb-0 number asset-quantities">
                        {quantities.toLocaleString()}
                    </span>
                    <div onClick={this.handleClickInfo} className="info-icon">
                        <FontAwesomeIcon icon="info-circle" />
                    </div>
                </div>
            </div>
        );
    }

    private handleClick = () => {
        const { assetType, onSelect } = this.props;
        onSelect(assetType);
    };

    private handleClickInfo = () => {
        const { assetType, address } = this.props;
        this.props.history.push(`/${address}/${assetType}`);
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const assetScheme = state.assetReducer.assetScheme[ownProps.assetType];
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
)(withRouter(AssetItem));
