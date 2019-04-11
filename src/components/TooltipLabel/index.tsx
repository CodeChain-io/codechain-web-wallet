import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Tooltip } from "reactstrap";

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

    public render() {
        const { t, tooltip } = this.props;
        return [
            <span
                key="tooltip-text"
                className="ml-1"
                id={`tooltip-${this.uniqueId}`}
            >
                <FontAwesomeIcon icon="question-circle" />
            </span>,
            <Tooltip
                key="tooltip-object"
                position="right"
                isOpen={this.state.tooltipOpen}
                target={`tooltip-${this.uniqueId}`}
                toggle={this.toggleTooltip}
            >
                {t(tooltip)}
            </Tooltip>
        ];
    }
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
