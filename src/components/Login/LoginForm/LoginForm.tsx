import * as React from "react";
import { Form } from "reactstrap";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./LoginForm.css";

interface Props {
    onChange: (passphrase: string) => void;
    onSignIn: () => void;
    passphrase: string;
    isValid?: boolean;
}

export default class LoginForm extends React.Component<Props, any> {
    public render() {
        const { passphrase, isValid } = this.props;
        return (
            <Form className="login-form" onSubmit={this.handleOnFormSubmit}>
                <h4 className="welcome-text">Welcome back!</h4>
                <div className="passphrase-input-container">
                    <ValidationInput
                        onChange={this.handleOnChagne}
                        value={passphrase}
                        showValidation={true}
                        labelText="PASSWORD"
                        placeholder="password"
                        type="password"
                        isValid={isValid}
                        error={
                            isValid === false ? "invalid password" : undefined
                        }
                    />
                </div>
                <div>
                    <button
                        className="btn btn-primary square sign-in-btn"
                        type="submit"
                    >
                        SIGN IN
                    </button>
                </div>
            </Form>
        );
    }

    private handleOnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        this.props.onSignIn();
    };

    private handleOnChagne = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = this.props;
        onChange(event.target.value);
    };
}
