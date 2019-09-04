import React from "react";
import NumberFormat from "react-number-format";
import { Label } from "reactstrap";
import TooltipLabel from "../TooltipLabel";
import IconCheck from "./img/icons-check.svg";
import IconError from "./img/icons-error.svg";
import "./ValidationInput.css";

interface Props {
    placeholder?: string;
    className?: string;
    error?: string | null;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value: string | number;
    type?: string;
    labelText?: string;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    isValid?: boolean;
    showValidation: boolean;
    reverse?: boolean;
    disable?: boolean;
    decimalScale?: number;
    tooltip?: string;
}
interface State {
    isFocus: boolean;
}
export default class ValidationInput extends React.Component<Props, State> {
    public uniqueId: string;
    constructor(props: Props) {
        super(props);
        this.state = { isFocus: false };
        this.uniqueId = this.makeId(10);
    }
    public render() {
        const {
            onChange,
            value,
            placeholder,
            className,
            type,
            labelText,
            error,
            onBlur,
            isValid,
            reverse,
            showValidation,
            disable,
            decimalScale,
            tooltip
        } = this.props;
        const { isFocus } = this.state;
        return (
            <div className={`Validation-input ${className} mb-4`}>
                {labelText && [
                    <Label
                        key="label"
                        for={`id-${this.uniqueId}`}
                        className={`mb-0 label-text ${reverse && "reverse"}`}
                    >
                        {labelText}
                    </Label>,
                    tooltip && <TooltipLabel tooltip={tooltip} key="tooltip" />
                ]}
                {type === "number" ? (
                    <NumberFormat
                        value={value}
                        decimalScale={decimalScale}
                        autoComplete="off"
                        className={`form-control ${reverse &&
                            "reverse"} ${showValidation && "validation-form"}`}
                        id={`id-${this.uniqueId}`}
                        placeholder={placeholder}
                        // onChange={onChange}
                        onBlur={onBlur}
                        disabled={disable}
                        thousandSeparator={true}
                        // tslint:disable-next-line:jsx-no-lambda
                        onFocus={() => {
                            this.setState({ isFocus: true });
                        }}
                        // tslint:disable-next-line:jsx-no-lambda
                        onBlurCapture={() => {
                            this.setState({ isFocus: false });
                        }}
                        // tslint:disable-next-line:jsx-no-lambda
                        onValueChange={values => {
                            const { value: v } = values;
                            if (onChange && isFocus) {
                                onChange({ target: { value: v } } as any);
                            }
                        }}
                    />
                ) : (
                    <input
                        autoComplete="off"
                        type={`${type || "text"}`}
                        className={`form-control ${reverse &&
                            "reverse"} ${showValidation && "validation-form"}`}
                        id={`id-${this.uniqueId}`}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={disable}
                    />
                )}
                {isValid && (
                    <img
                        className="valid-icon animated fadeIn"
                        src={IconCheck}
                        alt={"check"}
                    />
                )}
                {error && (
                    <img
                        className="error-icon animated fadeIn"
                        src={IconError}
                        alt={"error"}
                    />
                )}
                {error && (
                    <span className="error-text animated fadeIn">{error}</span>
                )}
            </div>
        );
    }

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
