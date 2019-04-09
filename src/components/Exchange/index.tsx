import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WalletAddress } from "../../model/address";
import { ReducerConfigure } from "../../redux";
import actions from "../../redux/wallet/walletActions";
import BTCAddress from "./BTCAddress";
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
}
type Props = StateProps & DispatchProps & RouteComponentProps;
class Exchange extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { selectedAddress: undefined };
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
        const { platformAddresses } = this.props;
        const { selectedAddress } = this.state;
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
                        <h2 className="title">Charge CCC</h2>
                        {!platformAddresses ? (
                            <span className="loading-text">Loading...</span>
                        ) : selectedAddress ? (
                            <div>
                                <div className="select-address-container">
                                    <span className="select-address-label">
                                        Top up your CCC address
                                    </span>
                                    <select
                                        onChange={
                                            this.handleChangeSelectAddress
                                        }
                                        className="form-control"
                                    >
                                        {platformAddresses.map(a => (
                                            <option key={a.address}>
                                                {a.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="description-container">
                                    <span className="description">
                                        You can get CCC by transferring BTC to
                                        the address below.
                                    </span>
                                </div>
                                <div className="btc-address-container">
                                    <BTCAddress address={selectedAddress} />
                                </div>
                                <div className="exchange-rate-container">
                                    <ExchangeRate />
                                </div>
                                <div className="exchange-history-container">
                                    <ExchangeHistory
                                        address={selectedAddress}
                                    />
                                </div>
                            </div>
                        ) : (
                            <span className="no-address-label">
                                There is no CCC address
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
)(Exchange);
