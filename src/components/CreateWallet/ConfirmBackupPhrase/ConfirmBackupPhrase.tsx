import * as _ from "lodash";
import * as React from "react";
import "./ConfirmBackupPhrase.css";

interface Props {
    phrases: string[];
    onConfirm: () => void;
}

interface State {
    selectedPhrases?: string[] | null;
    suffledPhrases: string[];
}

class ConfirmBackupPhrase extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedPhrases: undefined,
            suffledPhrases: _.shuffle(this.props.phrases)
        };
    }
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        const { phrases, onConfirm } = this.props;
        const { selectedPhrases, suffledPhrases } = this.state;
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
                    <div className="backup-phrase-input d-flex align-items-center justify-content-center">
                        {selectedPhrases && selectedPhrases.join(" ")}
                    </div>
                    <div className="backup-phrase-button-container text-center">
                        <div>
                            {_.map(suffledPhrases, text => {
                                return (
                                    <button
                                        key={`phrase-${text}`}
                                        className={`btn btn-primary backup-phrase-btn ${selectedPhrases &&
                                            _.includes(selectedPhrases, text) &&
                                            "reverse"}`}
                                        onClick={_.partial(
                                            this.toggleSelectPhrase,
                                            text
                                        )}
                                    >
                                        {text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        className="btn btn-primary reverse square main-btn"
                        disabled={
                            selectedPhrases == null ||
                            !_.isEqual(phrases, selectedPhrases)
                        }
                        onClick={onConfirm}
                    >
                        CONFIRM
                    </button>
                </div>
            </div>
        );
    }
    private toggleSelectPhrase = (phrase: string) => {
        const { selectedPhrases } = this.state;
        if (!selectedPhrases) {
            this.setState({ selectedPhrases: [phrase] });
            return;
        }
        if (_.includes(selectedPhrases, phrase)) {
            this.setState({
                selectedPhrases: _.filter(selectedPhrases, sp => sp !== phrase)
            });
        } else {
            this.setState({ selectedPhrases: [...selectedPhrases, phrase] });
        }
    };
}
export default ConfirmBackupPhrase;
