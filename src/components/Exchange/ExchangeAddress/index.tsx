import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { ReducerConfigure } from "../../../redux";
import { fetchExchangeAddressIfNeed } from "../../../redux/exchange/exchangeActions";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./index.css";

interface OwnProps {
    address: string;
    selectedCurrency: "btc" | "eth";
}

interface StateProps {
    exchangeAddress?: string;
}

interface DispatchProps {
    fetchExchangeAddressIfNeed: (
        address: string,
        selectedCurrency: "btc" | "eth"
    ) => Promise<void>;
}

type Props = WithTranslation & OwnProps & StateProps & DispatchProps;
class ExchangeAddress extends React.Component<Props> {
    public componentDidMount() {
        const { address, selectedCurrency } = this.props;
        this.props.fetchExchangeAddressIfNeed(address, selectedCurrency);
    }
    public componentWillUpdate(nextProps: Props) {
        if (
            nextProps.address !== this.props.address ||
            nextProps.selectedCurrency !== this.props.selectedCurrency
        ) {
            this.props.fetchExchangeAddressIfNeed(
                nextProps.address,
                nextProps.selectedCurrency
            );
        }
    }
    public render() {
        const { exchangeAddress, t, selectedCurrency } = this.props;
        return (
            <div className="BTC-address">
                <div className="d-flex input-container">
                    <ValidationInput
                        className="btc-input"
                        value={
                            exchangeAddress ||
                            t("charge:exchange_address.loading")!
                        }
                        showValidation={false}
                        disable={true}
                        labelText={t(
                            `charge:exchange_address.title.${selectedCurrency}`
                        )}
                    />
                    <CopyToClipboard
                        text={exchangeAddress || ""}
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
    const { address, selectedCurrency } = ownProps;
    return {
        exchangeAddress:
            (state.exchangeReducer.exchangeAddress[selectedCurrency] || {})[
                address
            ] &&
            state.exchangeReducer.exchangeAddress[selectedCurrency][address]
                .data
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchExchangeAddressIfNeed: (
        address: string,
        selectedCurrency: "btc" | "eth"
    ) => {
        return dispatch(fetchExchangeAddressIfNeed(address, selectedCurrency));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(ExchangeAddress));
