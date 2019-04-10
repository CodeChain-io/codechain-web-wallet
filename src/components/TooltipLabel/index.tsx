import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Tooltip } from "reactstrap";

interface Props {
    tooltip: string;
}

interface State {
    tooltipOpen: boolean;
}

export default class TooltipLabel extends React.Component<Props, State> {
    public uniqueId: string;
    constructor(props: Props) {
        super(props);
        this.state = { tooltipOpen: false };
        this.uniqueId = this.makeId(10);
    }

    public render() {
        const { tooltip } = this.props;
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
                {tooltip}
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
