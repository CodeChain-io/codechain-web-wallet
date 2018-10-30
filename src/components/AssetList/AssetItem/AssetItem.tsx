import { AggsUTXO, AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import { Actions } from "../../../actions";
import { getAssetByAssetType } from "../../../networks/Api";
import { IRootState } from "../../../reducers";
import { ImageLoader } from "../../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../../utils/network";
import "./AssetItem.css";

interface OwnProps {
    addressUTXO: AggsUTXO;
    networkId: string;
    address: string;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc;
}

interface DispatchProps {
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => void;
}

type Props = RouteComponentProps & OwnProps & DispatchProps & StateProps;

class AssetItem extends React.Component<Props, any> {
    public constructor(props: Props) {
        super(props);
    }
    public async componentDidMount() {
        const {
            addressUTXO,
            networkId,
            cacheAssetScheme,
            assetScheme
        } = this.props;
        if (!assetScheme) {
            try {
                const responseAssetScheme = await getAssetByAssetType(
                    new H256(addressUTXO.assetType),
                    networkId
                );
                cacheAssetScheme(
                    new H256(addressUTXO.assetType),
                    responseAssetScheme
                );
            } catch (e) {
                console.log(e);
            }
        }
    }
    public render() {
        const { addressUTXO, assetScheme, address } = this.props;
        if (!assetScheme) {
            return <div>Loading...</div>;
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div onClick={this.handleClick} className="Asset-item d-flex mb-3">
                <div className="image-container">
                    <ImageLoader
                        data={addressUTXO.assetType}
                        size={65}
                        isAssetImage={true}
                        networkId={getNetworkIdByAddress(address)}
                    />
                </div>
                <div className="name-container d-flex align-items-center">
                    <div className="pl-3">
                        <h6 className="mb-0">{metadata.name}</h6>
                        <p className="mb-0">
                            x {addressUTXO.totalAssetQuantity}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    private handleClick = () => {
        const { addressUTXO, address } = this.props;
        this.props.history.push(`/${address}/${addressUTXO.assetType}`);
    };
}
const mapStateToProps = (state: IRootState, ownProps: OwnProps) => ({
    assetScheme: state.assetScheme[ownProps.addressUTXO.assetType]
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => {
        dispatch(Actions.cacheAssetScheme(assetType, assetScheme));
    }
});
export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(AssetItem)
);
