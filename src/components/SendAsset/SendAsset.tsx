import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AssetSchemeDoc } from "codechain-indexer-types/lib/types";
import { Type } from "codechain-indexer-types/lib/utils";
import { H256 } from "codechain-sdk/lib/core/classes";
import * as React from "react";
import { connect } from "react-redux";
import { match } from "react-router";
import { Container, Label } from "reactstrap";
import { Dispatch } from "redux";
import { Actions } from "../../actions";
import { AggsUTXO } from "../../model/asset";
import {
    getAggsUTXOByAssetType,
    getAssetByAssetType
} from "../../networks/Api";
import { IRootState } from "../../reducers";
import { ImageLoader } from "../../utils/ImageLoader/ImageLoader";
import { getNetworkIdByAddress } from "../../utils/network";
import "./SendAsset.css";

interface OwnProps {
    match: match<{ address: string; assetType: string }>;
}

interface StateProps {
    assetScheme?: AssetSchemeDoc;
}

interface DispatchProps {
    cacheAssetScheme: (assetType: H256, assetScheme: AssetSchemeDoc) => void;
}

interface State {
    aggsUTXO?: AggsUTXO;
    hasAggsUTXORequested: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendAsset extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            aggsUTXO: undefined,
            hasAggsUTXORequested: false
        };
    }

    public componentWillReceiveProps(props: Props) {
        const {
            match: {
                params: { assetType }
            }
        } = this.props;
        const {
            match: {
                params: { assetType: nextAssetType }
            }
        } = props;
        if (nextAssetType !== assetType) {
            this.setState({ hasAggsUTXORequested: false, aggsUTXO: undefined });
            this.getAggsUTXO();
        }
    }

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

        this.getAggsUTXO();
    }

    public render() {
        const {
            assetScheme,
            match: {
                params: { assetType, address }
            }
        } = this.props;
        const { aggsUTXO, hasAggsUTXORequested } = this.state;
        if (!assetScheme || !hasAggsUTXORequested) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">Loading...</div>
                    </Container>
                </div>
            );
        }
        if (!aggsUTXO) {
            return (
                <div>
                    <Container>
                        <div className="mt-5">ERROR! Invalid assetType</div>
                    </Container>
                </div>
            );
        }
        const metadata = Type.getMetadata(assetScheme.metadata);
        return (
            <div className="Send-asset">
                <Container>
                    <div className="mt-5">
                        <h4>Send asset</h4>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center asset-info-item">
                        <div>
                            <ImageLoader
                                data={assetType}
                                isAssetImage={true}
                                networkId={getNetworkIdByAddress(address)}
                                size={50}
                            />
                        </div>
                        <div className="ml-2">
                            <p className="mb-0">{metadata.name || assetType}</p>
                            <p className="mb-0">
                                {aggsUTXO.totalAssetQuantity}
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className="receiver-container">
                        <form>
                            <div className="form-group">
                                <Label for="asset-address">Address</Label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="asset-address"
                                    placeholder="Enter Address"
                                />
                                <Label for="quantities">Quantities</Label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="quantities"
                                    placeholder="Enter quantities"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="mt-3">
                        <div className="add-btn d-flex align-items-center justify-content-center">
                            <FontAwesomeIcon icon="plus" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <button type="button" className="btn btn-primary">
                            Send
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    private getAggsUTXO = async () => {
        const {
            match: {
                params: { address, assetType }
            }
        } = this.props;
        try {
            const UTXO = await getAggsUTXOByAssetType(
                address,
                new H256(assetType),
                getNetworkIdByAddress(address)
            );
            this.setState({ aggsUTXO: UTXO, hasAggsUTXORequested: true });
        } catch (e) {
            console.log(e);
        }
    };
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
)(SendAsset);
