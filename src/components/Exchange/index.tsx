import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import CurrencyToggleButton from "./CurrencyToggleButton";
import ExchangeAddress from "./ExchangeAddress";
import ExchangeHistory from "./ExchangeHistory";
import ExchangeRate from "./ExchangeRate";
import "./index.css";

interface StateProps {
    platformAddresses: WalletAddress[];
}

interface DispatchProps {
    fetchWalletFromStorageIfNeed: () => void;
}

interface State {
    selectedAddress?: string;
    selectedCurrency: "btc" | "eth";
}
type Props = WithTranslation & StateProps & DispatchProps & RouteComponentProps;
class Exchange extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedAddress: undefined, selectedCurrency: "btc" };
    }
    public componentDidMount() {
        this.props.fetchWalletFromStorageIfNeed();
        if (this.props.platformAddresses) {
            if (this.props.platformAddresses.length > 0) {
                this.setState({
                    selectedAddress: this.props.platformAddresses[0].address
                });
            }
        }
    }
    public componentWillUpdate(nextProps: Props) {
        if (!this.props.platformAddresses && nextProps.platformAddresses) {
            if (nextProps.platformAddresses.length > 0) {
                this.setState({
                    selectedAddress: nextProps.platformAddresses[0].address
                });
            }
        }
    }
    public render() {
        const { platformAddresses, t } = this.props;
        const { selectedAddress, selectedCurrency } = this.state;
        return (
            <div className="Exchange">
                <Container>
                    <div className="page-container d-flex back-icon-container">
                        <Link to="/" className="ml-auto">
                            <FontAwesomeIcon
                                className="back-icon"
                                icon="arrow-left"
                            />
                        </Link>
                    </div>
                    <div className="page-container exchange-container">
                        <div className="d-flex">
                            <h2 className="title mr-auto">
                                <Trans i18nKey={"charge:title"} />
                            </h2>
                            <CurrencyToggleButton
                                selectedCurrency={this.state.selectedCurrency}
                                onChangedCurrency={
                                    this.handleChangeSelectCurrency
                                }
                            />
                        </div>
                        {!platformAddresses ? (
                            <span className="loading-text">
                                <Trans i18nKey="charge:loading" />
                            </span>
                        ) : selectedAddress ? (
                            <div>
                                <div className="select-address-container">
                                    <span className="select-address-label">
                                        <Trans i18nKey="charge:select_address.title" />
                                    </span>
                                    <select
                                        onChange={
                                            this.handleChangeSelectAddress
                                        }
                                        className="form-control"
                                    >
                                        {platformAddresses.map(a => (
                                            <option
                                                key={a.address}
                                                value={a.address}
                                            >
                                                CCC{" "}
                                                {t("main:address", {
                                                    index: a.index + 1
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="description-container">
                                    <span className="description">
                                        <Trans
                                            i18nKey={`charge:description.${selectedCurrency}`}
                                        />
                                    </span>
                                </div>
                                <div className="btc-address-container">
                                    <ExchangeAddress
                                        selectedCurrency={selectedCurrency}
                                        address={selectedAddress}
                                    />
                                </div>
                                <div className="exchange-rate-container">
                                    <ExchangeRate
                                        selectedCurrency={selectedCurrency}
                                    />
                                </div>
                                <div className="exchange-history-container">
                                    <ExchangeHistory
                                        address={selectedAddress}
                                        selectedCurrency={selectedCurrency}
                                    />
                                </div>
                            </div>
                        ) : (
                            <span className="no-address-label">
                                <Trans i18nKey="charge:empty_address" />
                            </span>
                        )}
                    </div>
                </Container>
            </div>
        );
    }
    private handleChangeSelectAddress = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        this.setState({ selectedAddress: event.target.value });
    };
    private handleChangeSelectCurrency = (currency: "btc" | "eth") => {
        this.setState({ selectedCurrency: currency });
    };
}

const mapStateToProps = (state: ReducerConfigure) => ({
    platformAddresses: state.walletReducer.platformAddresses
});
const mapDispatchToProps = (
    dispatch: ThunkDispatch<ReducerConfigure, void, Action>
) => ({
    fetchWalletFromStorageIfNeed: () => {
        dispatch(actions.fetchWalletFromStorageIfNeed());
    }
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(Exchange));
