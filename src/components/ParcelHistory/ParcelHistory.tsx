import { ParcelDoc, PendingParcelDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import chainActions from "../../redux/chain/chainActions";
import * as Empty from "./img/cautiondisabled.svg";
import "./ParcelHistory.css";
import ParcelItem from "./ParcelItem/ParcelItem";

interface OwnProps {
    address: string;
}

interface StateProps {
    pendingParcelList?: PendingParcelDoc[] | null;
    parcelList?: ParcelDoc[] | null;
    bestBlockNumber?: number | null;
    networkId: NetworkId;
}

interface DispatchProps {
    fetchPendingParcelListIfNeed: (address: string) => void;
    fetchParcelListIfNeed: (address: string) => void;
    fetchBestBlockNumberIfNeed: () => void;
}

type Props = StateProps & OwnProps & DispatchProps;

class ParcelHistory extends React.Component<Props> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            pendingParcelList: undefined,
            parcelList: undefined,
            bestBlockNumber: undefined
        };
    }

    public componentDidMount() {
        this.init();
    }

    public render() {
        const {
            pendingParcelList,
            parcelList,
            bestBlockNumber,
            address,
            networkId
        } = this.props;
        if (!pendingParcelList || !parcelList || !bestBlockNumber) {
            return <div>Loading...</div>;
        }
        const parcelHashList = _.map(parcelList, parcel => parcel.hash);
        const validPendingParcelList = _.filter(
            pendingParcelList,
            pendingParcel =>
                !_.includes(parcelHashList, pendingParcel.parcel.hash)
        );
        return (
            <div className="Parcel-history">
                {validPendingParcelList.length + parcelList.length === 0 && (
                    <div className="d-flex align-items-center justify-content-center">
                        <div>
                            <div className="text-center mt-3">
                                <img src={Empty} />
                            </div>
                            <div className="mt-3 empty">
                                There is no transaction
                            </div>
                        </div>
                    </div>
                )}
                {_.map(validPendingParcelList, pendingTx => (
                    <ParcelItem
                        key={pendingTx.parcel.hash}
                        parcel={pendingTx.parcel}
                        bestBlockNumber={bestBlockNumber}
                        address={address}
                        networkId={networkId}
                        isPending={true}
                        timestamp={pendingTx.timestamp}
                    />
                ))}
                {_.map(parcelList, parcel => (
                    <ParcelItem
                        key={parcel.hash}
                        parcel={parcel}
                        address={address}
                        bestBlockNumber={bestBlockNumber}
                        networkId={networkId}
                        isPending={false}
                        timestamp={parcel.timestamp}
                    />
                ))}
            </div>
        );
    }

    private init = async () => {
        this.fetchAll();
    };

    private fetchAll = () => {
        const {
            address,
            fetchBestBlockNumberIfNeed,
            fetchParcelListIfNeed,
            fetchPendingParcelListIfNeed
        } = this.props;
        fetchBestBlockNumberIfNeed();
        fetchPendingParcelListIfNeed(address);
        fetchParcelListIfNeed(address);
    };
}

const mapStateToProps = (state: ReducerConfigure, props: OwnProps) => {
    const { address } = props;
    const pendingParcelList = state.chainReducer.pendingParcelList[address];
    const parcelList = state.chainReducer.parcelList[address];
    const bestBlockNumber = state.chainReducer.bestBlockNumber;
    const networkId = state.globalReducer.networkId;
    return {
        pendingParcelList: pendingParcelList && pendingParcelList.data,
        parcelList: parcelList && parcelList.data,
        bestBlockNumber: bestBlockNumber && bestBlockNumber.data,
        networkId
    };
};
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchPendingParcelListIfNeed: (address: string) => {
        dispatch(chainActions.fetchPendingParcelListIfNeed(address));
    },
    fetchParcelListIfNeed: (address: string) => {
        dispatch(chainActions.fetchParcelListIfNeed(address));
    },
    fetchBestBlockNumberIfNeed: () => {
        dispatch(chainActions.fetchBestBlockNumberIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ParcelHistory);
