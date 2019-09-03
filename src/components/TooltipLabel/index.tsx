import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Tooltip } from "reactstrap";
import "./index.css";

interface OwnProps {
    tooltip: string;
}

interface State {
    tooltipOpen: boolean;
}

type Props = WithTranslation & OwnProps;

class TooltipLabel extends React.Component<Props, State> {
    public uniqueId: string;
    constructor(props: Props) {
        super(props);
        this.state = { tooltipOpen: false };
        this.uniqueId = this.makeId(10);
    }

    public componentDidMount() {
        document.addEventListener("mousedown", this.closeTooltip);
        document.addEventListener("touchend", this.closeTooltip);
    }

    public componentWillUnmount() {
        document.removeEventListener("mousedown", this.closeTooltip);
        document.removeEventListener("touchend", this.closeTooltip);
    }

    public render() {
        const { t, tooltip } = this.props;
        return (
            <div className="Tooltip-label">
                <span
                    key="tooltip-text"
                    className="ml-1"
                    id={`tooltip-${this.uniqueId}`}
                >
                    <FontAwesomeIcon
                        icon="question-circle"
                        className="question-circle"
                    />
                </span>
                <Tooltip
                    trigger="click"
                    key="tooltip-object"
                    position="right"
                    isOpen={this.state.tooltipOpen}
                    target={`tooltip-${this.uniqueId}`}
                    toggle={this.toggleTooltip}
                >
                    {t(tooltip)}
                </Tooltip>
            </div>
        );
    }

    private closeTooltip = () => {
        this.setState({
            tooltipOpen: false
        });
    };

    private toggleTooltip = () => {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    };

    private makeId = (length: number) => {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < length; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }

        return text;
    };
}

export default withTranslation()(TooltipLabel);
