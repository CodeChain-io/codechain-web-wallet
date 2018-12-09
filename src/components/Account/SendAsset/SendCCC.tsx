import * as React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { U256 } from "codechain-sdk/lib/core/classes";
import * as _ from "lodash";
import { connect } from "react-redux";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NetworkId } from "../../../model/address";
import { ReducerConfigure } from "../../../redux";
import accountActions from "../../../redux/account/accountActions";
import { changeQuarkToCCCString } from "../../../utils/unit";
import CCCReceiverContainer from "./CCCReceiverContainer/CCCReceiverContainer";
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
}

interface DispatchProps {
    fetchAvailableQuark: (address: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class SendCCC extends React.Component<Props, any> {
    public render() {
        const { onClose } = this.props;
        const { availableQuark } = this.props;
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
        console.log(receiver.address);
        console.log(receiver.amount.value.toString(10));
        console.log(fee.value.toString(10));
        /*
        const { UTXOList } = this.props;
        const { address, networkId, passphrase } = this.props;
        const sumOfSendingAsset = _.sumBy(
            receivers,
            receiver => receiver.quantity
        );

        const inputUTXO = [];
        let currentSum = 0;
        for (const utxo of UTXOList!) {
            inputUTXO.push(utxo);
            currentSum += utxo.asset.amount;
            if (currentSum > sumOfSendingAsset) {
                break;
            }
        }

        const sdk = new SDK({
            server: getCodeChainHost(networkId),
            networkId
        });
        const ccKey = await getCCKey();
        // FIXME: remove any
        const keyStore = new LocalKeyStore(ccKey as any);*/
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
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendCCC);
