import * as _ from "lodash";
import * as React from "react";
import "./ConfirmBackupPhrase.css";

class ConfirmBackupPhrase extends React.Component<any, any> {
    public render() {
        return (
            <div className="Confirm-backup-phrase animated fadeIn">
                <div className="title-container">
                    <h4 className="title">
                        Confirm your
                        <br />
                        backup phrase
                    </h4>
                </div>
                <div className="description">
                    Please select each phrase in order to make sure it is
                    correct.
                </div>
                <div>
                    <div className="backup-phrase-input">hi</div>
                    <div className="backup-phrase-button-container">
                        {_.map(
                            [
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
                            ],
                            text => {
                                return (
                                    <button
                                        key={`phrase-${text}`}
                                        className="btn btn-primary backup-phrase-btn"
                                    >
                                        {text}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>
                <div>
                    <button className="btn btn-primary reverse square main-btn">
                        CONFIRM
                    </button>
                </div>
            </div>
        );
    }
}
export default ConfirmBackupPhrase;
