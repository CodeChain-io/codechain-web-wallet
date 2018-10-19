import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { Container, Table } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { getAssetByAssetType } from "../../networks/Api";
import { IRootState } from "../../reducers";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../utils/network";
import "./AssetDetail.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc;
}

interface DispatchProps {
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class AssetDetail extends React.Component<Props, any> {
    public async componentDidMount() {
        const {
            match: {
                params: { address, assetType }
            },
            assetScheme,
            cacheAssetScheme
        } = this.props;
        if (!assetScheme) {
            const networkId = getNetworkIdByAddress(address);
            try {
                const responseAssetScheme = await getAssetByAssetType(
                    new H256(assetType),
                    networkId
                );
                cacheAssetScheme(new H256(assetType), responseAssetScheme);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public render() {
        const {
            assetScheme,
            match: {
                params: { assetType, address }
            }
        } = this.props;
        if (!assetScheme) {
            return <div>Loading...</div>;
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
}

const mapStateToProps = (state: IRootState, ownProps: OwnProps) => {
    const {
        match: {
            params: { assetType }
        }
    } = ownProps;
    return {
        assetScheme: state.assetScheme[new H256(assetType).value]
    };
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => {
        dispatch(Actions.cacheAssetScheme(assetType, assetScheme));
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssetDetail);
