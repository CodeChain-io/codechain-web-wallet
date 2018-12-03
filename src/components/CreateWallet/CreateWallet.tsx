import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Container } from "reactstrap";

import * as _ from "lodash";
import { Link } from "react-router-dom";
import ConfirmBackupPhrase from "./ConfirmBackupPhrase/ConfirmBackupPhrase";
import "./CreateWallet.css";
import InputPassphrase from "./InputPassphrase/InputPassphrase";
import ShowBackupPhrase from "./ShowBackupPhrase/ShowBackupPhrase";

enum PageState {
    inputPassPhrase = 1,
    showSecretPhrase,
    confirmSecretPhrase
}

interface State {
    currentPage: PageState;
}

class CreateWallet extends React.Component<any, State> {
    public constructor(props: any) {
        super(props);
        this.state = {
            currentPage: PageState.inputPassPhrase
        };
    }
    public render() {
        const { currentPage } = this.state;
        return (
            <Container className="Create-wallet animated fadeIn">
                <div className="close-btn">
                    <Link to="/selectKeyfile">
                        <FontAwesomeIcon icon="times" className="icon" />
                    </Link>
                </div>
                <div className="create-wallet-form-group">
                    {currentPage === PageState.inputPassPhrase && (
                        <InputPassphrase
                            onSubmit={this.handleSubmitPassphraseInput}
                        />
                    )}
                    {currentPage === PageState.showSecretPhrase && (
                        <ShowBackupPhrase
                            onSubmit={this.handleSumitShowPhrase}
                        />
                    )}
                    {currentPage === PageState.confirmSecretPhrase && (
                        <ConfirmBackupPhrase
                            phrases={[
                                "popular",
                                "fence",
                                "nomineewear",
                                "north",
                                "tattoo",
                                "ethics",
                                "deputy",
                                "raven",
                                "obey",
                                "junk",
                                "guard"
                            ]}
                        />
                    )}
                </div>
                <div className="dot-indicator-container">
                    {_.map(_.range(3), index => {
                        return (
                            <FontAwesomeIcon
                                key={`dot-${index}`}
                                icon="circle"
                                className={`indicator-icon ${
                                    index < currentPage ? "active" : "inactive"
                                }`}
                            />
                        );
                    })}
                </div>
            </Container>
        );
    }

    private handleSubmitPassphraseInput = () => {
        this.setState({ currentPage: PageState.showSecretPhrase });
    };

    private handleSumitShowPhrase = () => {
        this.setState({ currentPage: PageState.confirmSecretPhrase });
    };
}

export default CreateWallet;
