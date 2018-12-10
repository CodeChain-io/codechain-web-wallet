import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SDK } from "codechain-sdk";
import { SignedParcel, U256 } from "codechain-sdk/lib/core/classes";
import { LocalKeyStore } from "codechain-sdk/lib/key/LocalKeyStore";
import * as _ from "lodash";
import { connect } from "react-redux";
import * as Spinner from "react-spinkit";
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
import { changeQuarkToCCCString } from "../../../utils/unit";
import CCCReceiverContainer from "./CCCReceiverContainer/CCCReceiverContainer";
import * as CheckIcon from "./img/check_icon.svg";
import "./SendCCC.css";

interface OwnProps {
    address: string;
    isSendingCCC: boolean;
    onClose: () => void;
}

interface StateProps {
    availableQuark?: U256 | null;
    networkId: NetworkId;
    passphrase: string;
    isSendingParcel: boolean;
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
    sendSignedParcel: (address: string, signedParcel: SignedParcel) => void;
}

interface State {
    isSendBtnClicked?: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendCCC extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isSendBtnClicked: undefined
        };
    }
    public render() {
        const { onClose, availableQuark, isSendingParcel } = this.props;
        const { isSendBtnClicked } = this.state;
        if (!availableQuark) {
            return (
                <div>
                    <div className="mt-5">Loading...</div>
                </div>
            );
        }
        return (
            <div className="Send-CCC animated fadeIn">
                <div className="cancel-icon-container" onClick={onClose}>
                    <FontAwesomeIcon className="cancel-icon" icon="times" />
                </div>
                <h2 className="title">Send CCC</h2>
                {isSendBtnClicked && !isSendingParcel ? (
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
                                {changeQuarkToCCCString(availableQuark)}
                                CCC
                            </span>
                        </div>
                        <CCCReceiverContainer
                            onSubmit={this.handleSubmit}
                            totalAmount={availableQuark}
                        />
                    </div>
                )}
                {isSendingParcel && (
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
            amount: U256;
        },
        fee: U256
    ) => {
        const { networkId, address, passphrase } = this.props;
        const sdk = new SDK({
            server: getCodeChainHost(networkId),
            networkId
        });

        const parcel = sdk.core.createPaymentParcel({
            recipient: receiver.address,
            amount: receiver.amount
        });

        const ccKey = await getCCKey();

        const storedPlatformKeys = getPlatformKeys(networkId);
        const storedAssetKeys = getAssetKeys(networkId);
        const seedHash = await getFirstSeedHash();

        let keyMapping = _.reduce(
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

        keyMapping = _.reduce(
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
            keyMapping
        );

        const keyStore = new LocalKeyStore(ccKey, keyMapping);
        const nonce = await sdk.rpc.chain.getNonce(address);
        const signedParcel = await sdk.key.signParcel(parcel, {
            account: address,
            keyStore,
            fee,
            nonce,
            passphrase
        });
        this.props.sendSignedParcel(address, signedParcel);
        this.setState({ isSendBtnClicked: true });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { address } = ownProps;
    const availableQuark = state.accountReducer.availableQuark[address];
    const networkId = state.globalReducer.networkId;
    const passphrase = state.globalReducer.passphrase!;
    const sendingSignedParcel = state.chainReducer.sendingSignedParcel[address];
    return {
        availableQuark,
        networkId,
        passphrase,
        isSendingParcel: sendingSignedParcel != null
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchAvailableQuark: (address: string) => {
        dispatch(accountActions.fetchAvailableQuark(address));
    },
    sendSignedParcel: (address: string, signedParcel: SignedParcel) => {
        dispatch(chainActions.sendSignedParcel(address, signedParcel));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendCCC);
