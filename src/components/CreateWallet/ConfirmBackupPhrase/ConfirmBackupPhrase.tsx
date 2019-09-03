import _ from "lodash";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import "./ConfirmBackupPhrase.css";

interface OwnProps {
    phrases: string[];
    onConfirm: () => void;
}

interface State {
    selectedPhrasesIndex?: number[] | null;
    suffledPhrases: string[];
}

type Props = WithTranslation & OwnProps;

class ConfirmBackupPhrase extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedPhrasesIndex: undefined,
            suffledPhrases: _.shuffle(this.props.phrases)
        };
    }
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        const { phrases, onConfirm } = this.props;
        const { selectedPhrasesIndex, suffledPhrases } = this.state;
        return (
            <div className="Confirm-backup-phrase animated fadeIn">
                <div className="title-container">
                    <h4 className="title">
                        <Trans i18nKey="create:confirm.title" />
                    </h4>
                </div>
                <div className="description">
                    <Trans i18nKey="create:confirm.detail" />
                </div>
                <div>
                    <div className="backup-phrase-input d-flex align-items-center justify-content-center">
                        {selectedPhrasesIndex &&
                            this.indexToString(selectedPhrasesIndex).join(" ")}
                    </div>
                    <div className="backup-phrase-button-container text-center">
                        <div>
                            {_.map(suffledPhrases, (text, index) => {
                                return (
                                    <button
                                        key={`phrase-${text}`}
                                        className={`btn btn-primary backup-phrase-btn ${selectedPhrasesIndex &&
                                            _.includes(
                                                selectedPhrasesIndex,
                                                index
                                            ) &&
                                            "reverse"}`}
                                        onClick={_.partial(
                                            this.toggleSelectPhrase,
                                            index
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
                            selectedPhrasesIndex == null ||
                            !_.isEqual(
                                phrases,
                                this.indexToString(selectedPhrasesIndex)
                            )
                        }
                        onClick={onConfirm}
                    >
                        <Trans i18nKey="create:confirm.button" />
                    </button>
                </div>
            </div>
        );
    }
    private indexToString = (selectedPhraseIndex: number[]) => {
        const { suffledPhrases } = this.state;
        return _.map(selectedPhraseIndex, i => suffledPhrases[i]);
    };
    private toggleSelectPhrase = (index: number) => {
        const { selectedPhrasesIndex } = this.state;
        if (!selectedPhrasesIndex) {
            this.setState({ selectedPhrasesIndex: [index] });
            return;
        }
        if (_.includes(selectedPhrasesIndex, index)) {
            this.setState({
                selectedPhrasesIndex: _.filter(
                    selectedPhrasesIndex,
                    sp => sp !== index
                )
            });
        } else {
            this.setState({
                selectedPhrasesIndex: [...selectedPhrasesIndex, index]
            });
        }
    };
}
export default withTranslation()(ConfirmBackupPhrase);
