import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SDK } from "codechain-sdk";
import { SignedTransaction, U64 } from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import * as _ from "lodash";
import { connect } from "react-redux";
import * as Spinner from "react-spinkit";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../model/address";
import {
    getAssetAddressPath,
    getCCKey,
    getFirstSeedHash,
    getPlatformAddressPath
} from "../../../model/keystore";
import { ReducerConfigure } from "../../../redux";
import accountActions from "../../../redux/account/accountActions";
import chainActions from "../../../redux/chain/chainActions";
import { getCodeChainHost } from "../../../utils/network";
import { getAssetKeys, getPlatformKeys } from "../../../utils/storage";
import CCCReceiverContainer from "./CCCReceiverContainer/CCCReceiverContainer";
import * as CheckIcon from "./img/check_icon.svg";
import "./SendCCC.css";

interface OwnProps {
    address: string;
    onClose: () => void;
}

interface StateProps {
    availableQuark?: U64 | null;
    networkId: NetworkId;
    passphrase: string;
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction
    ) => Promise<{}>;
}

interface State {
    isSending: boolean;
    isSent: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendCCC extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isSending: false,
            isSent: false
        };
    }
    public render() {
        const { onClose, availableQuark, address } = this.props;
        const { isSending, isSent } = this.state;
        if (!availableQuark) {
            return (
                <div>
                    <div className="Send-CCC">
                        <div className="loading-container" />
                    </div>
                </div>
            );
        }
        return (
            <div className="Send-CCC animated fadeIn">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Send CCC</h2>
                {isSent ? (
                    <div className="d-flex align-items-center justify-content-center text-center complete-container">
                        <div className="text-center">
                            <div>
                                <img src={CheckIcon} />
                            </div>
                            <div className="mt-3">
                                <span>COMPLETE!</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="d-flex align-items-center balance-container mb-4">
                            <div className="mr-auto balance-text">Balance</div>
                            <span className="amount number">
                                {availableQuark.toLocaleString()} CCC
                            </span>
                        </div>
                        <CCCReceiverContainer
                            address={address}
                            onSubmit={this.handleSubmit}
                            totalAmount={availableQuark}
                            isSending={isSending}
                        />
                    </div>
                )}
                {isSending && (
                    <div className="sending-panel d-flex align-items-center justify-content-center">
                        <Spinner name="line-scale" color="white" />
                    </div>
                )}
            </div>
        );
    }

    public async componentDidMount() {
        this.init();
    }

    private init = () => {
        const { address, fetchAvailableQuark } = this.props;
        fetchAvailableQuark(address);
    };

    private handleSubmit = async (
        receiver: {
            address: string;
            quantity: U64;
        },
        fee: U64
    ) => {
        const { networkId, address, passphrase } = this.props;
        const sdk = new SDK({
            server: getCodeChainHost(networkId),
            networkId
        });

        const tx = sdk.core.createPayTransaction({
            recipient: receiver.address,
            quantity: receiver.quantity
        });

        const ccKey = await getCCKey();

        const storedPlatformKeys = getPlatformKeys(networkId);
        const storedAssetKeys = getAssetKeys(networkId);
        const seedHash = await getFirstSeedHash();

        const platformKeyMapping = _.reduce(
            storedPlatformKeys,
            (memo, storedPlatformKey) => {
                return {
                    ...memo,
                    [storedPlatformKey.key]: {
                        seedHash,
                        path: getPlatformAddressPath(
                            storedPlatformKey.pathIndex
                        )
                    }
                };
            },
            {}
        );

        const assetKeyMapping = _.reduce(
            storedAssetKeys,
            (memo, storedAssetKey) => {
                return {
                    ...memo,
                    [storedAssetKey.key]: {
                        seedHash,
                        path: getAssetAddressPath(storedAssetKey.pathIndex)
                    }
                };
            },
            {}
        );

        const keyStore = new LocalKeyStore(ccKey, {
            platform: platformKeyMapping,
            asset: assetKeyMapping
        });
        const seq = await sdk.rpc.chain.getSeq(address);
        const signedTx = await sdk.key.signTransaction(tx, {
            account: address,
            keyStore,
            fee,
            seq,
            passphrase
        });
        this.setState({ isSending: true });
        try {
            await this.props.sendSignedTransaction(address, signedTx);
            this.setState({ isSent: true });
        } catch (e) {
            toast.error("Server is not responding.", {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                closeButton: false,
                hideProgressBar: true
            });
            console.error(e);
        }
        this.setState({ isSending: false });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { address } = ownProps;
    const availableQuark = state.accountReducer.availableQuark[address];
    const networkId = state.globalReducer.networkId;
    const passphrase = state.globalReducer.passphrase!;
    return {
        availableQuark,
        networkId,
        passphrase
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    },
    sendSignedTransaction: (
        address: string,
        signedTransaction: SignedTransaction
    ) => {
        return dispatch(
            chainActions.sendSignedTransaction(address, signedTransaction)
        );
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendCCC);
