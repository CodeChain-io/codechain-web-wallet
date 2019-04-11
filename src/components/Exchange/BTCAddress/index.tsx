import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../../redux";
import { fetchBTCAddressIfNeed } from "../../../redux/exchange/exchangeActions";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./index.css";

interface OwnProps {
    address: string;
}

interface StateProps {
    btcAddress?: string;
}

interface DispatchProps {
    fetchBTCAddressIfNeed: (address: string) => Promise<void>;
}

type Props = WithTranslation & OwnProps & StateProps & DispatchProps;
class BTCAddress extends React.Component<Props> {
    public componentDidMount() {
        const { address } = this.props;
        this.props.fetchBTCAddressIfNeed(address);
    }
    public componentWillUpdate(nextProps: Props) {
        if (nextProps.address !== this.props.address) {
            this.props.fetchBTCAddressIfNeed(nextProps.address);
        }
    }
    public render() {
        const { btcAddress, t } = this.props;
        return (
            <div className="BTC-address">
                <div className="d-flex input-container">
                    <ValidationInput
                        className="btc-input"
                        value={btcAddress || t("charge:btc_address.loading")!}
                        showValidation={false}
                        disable={true}
                        labelText={t("charge:btc_address.title")}
                    />
                    <CopyToClipboard
                        text={btcAddress || ""}
                        onCopy={this.handleCopyPhrase}
                    >
                        <div className="copy-btn-container">
                            <FontAwesomeIcon icon="copy" />
                        </div>
                    </CopyToClipboard>
                </div>
            </div>
        );
    }

    private handleCopyPhrase = () => {
        toast.info(this.props.t("main:copied"), {
            position: toast.POSITION.BOTTOM_CENTER,
            autoClose: 1000,
            closeButton: false,
            hideProgressBar: true
        });
    };
}

const mapStateToProps = (state: ReducerConfigure, ownProps: OwnProps) => {
    const { address } = ownProps;
    return {
        btcAddress:
            state.exchangeReducer.btcAddress[address] &&
            state.exchangeReducer.btcAddress[address].data
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchBTCAddressIfNeed: (address: string) => {
        return dispatch(fetchBTCAddressIfNeed(address));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(BTCAddress));
