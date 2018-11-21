import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { Container, Table } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/asset/assetActions";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../utils/network";
import "./AssetDetail.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc | null;
}

interface DispatchProps {
    fetchAssetSchemeIfNeed: (assetType: H256, networkId: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetDetail extends React.Component<Props, any> {
    public async componentDidMount() {
        this.init();
    }

    public render() {
        const {
            assetScheme,
            match: {
                params: { assetType, address }
            }
        } = this.props;
        if (!assetScheme) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
                </div>
            );
        }

        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Asset-detail">
                <Container>
                    <div className="mt-5">
                        <Link to={`/${address}/${assetType}/send`}>
                            <button
                                type="button"
                                className="float-right btn btn-primary"
                            >
                                Send Asset
                            </button>
                        </Link>
                        <h4 className="mr-auto">Asset</h4>
                    </div>
                    <hr />
                    <h6>{assetType}</h6>
                    <Table>
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <td>{metadata.name || "None"}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{metadata.description || "None"}</td>
                            </tr>
                            <tr>
                                <th>Icon</th>
                                <td>
                                    <ImageLoader
                                        data={assetType}
                                        isAssetImage={true}
                                        size={65}
                                        networkId={getNetworkIdByAddress(
                                            address
                                        )}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>Raw metadata</th>
                                <td>{assetScheme.metadata}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Container>
            </div>
        );
    }

    private init = () => {
        const {
            match: {
                params: { assetType, address }
            }
        } = this.props;
        this.props.fetchAssetSchemeIfNeed(
            new H256(assetType),
            getNetworkIdByAddress(address)
        );
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const {
        match: {
            params: { assetType }
        }
    } = ownProps;
    const assetScheme =
        state.assetReducer.assetScheme[new H256(assetType).value];
    return {
        assetScheme: assetScheme && assetScheme.data
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAssetSchemeIfNeed: (assetType: H256, networkId: string) => {
        dispatch(actions.fetchAssetSchemeIfNeed(assetType, networkId));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetDetail);
