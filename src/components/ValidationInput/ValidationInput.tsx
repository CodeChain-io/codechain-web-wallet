import * as React from "react";
import NumberFormat from "react-number-format";
import { Label } from "reactstrap";
import * as IconCheck from "./img/icons-check.svg";
import * as IconError from "./img/icons-error.svg";
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
}
interface State {
    isFocus: boolean;
}
export default class ValidationInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { isFocus: false };
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
            decimalScale
        } = this.props;
        const guid = this.guid();
        const { isFocus } = this.state;
        return (
            <div className={`Validation-input ${className} mb-4`}>
                {labelText && (
                    <Label
                        for={`id-${guid}`}
                        className={`mb-0 label-text ${reverse && "reverse"}`}
                    >
                        {labelText}
                    </Label>
                )}
                {type === "number" ? (
                    <NumberFormat
                        value={value}
                        decimalScale={decimalScale}
                        autoComplete="off"
                        className={`form-control ${reverse &&
                            "reverse"} ${showValidation && "validation-form"}`}
                        id={`id-${guid}`}
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
                        id={`id-${guid}`}
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
                    />
                )}
                {error && (
                    <img
                        className="error-icon animated fadeIn"
                        src={IconError}
                    />
                )}
                {error && (
                    <span className="error-text animated fadeIn">{error}</span>
                )}
            </div>
        );
    }
    private guid = () => {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return (
            s4() +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            s4() +
            s4()
        );
    };
}
