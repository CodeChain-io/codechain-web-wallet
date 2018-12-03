import * as React from "react";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./LoginForm.css";

interface Props {
    onChange: (passphrase: string) => void;
    onSignIn: () => void;
    passphrase: string;
}

export default class LoginForm extends React.Component<Props, any> {
    public render() {
        const { passphrase, onSignIn } = this.props;
        return (
            <div className="login-form">
                <h4 className="welcome-text">Welcome back!</h4>
                <div className="passphrase-input-container">
                    <ValidationInput
                        onChange={this.handleOnChagne}
                        value={passphrase}
                        showValidation={true}
                        labelText="PASSPHRASE"
                        placeholder="passphrase"
                    />
                </div>
                <div>
                    <button
                        className="btn btn-primary square sign-in-btn"
                        onClick={onSignIn}
                    >
                        SIGN IN
                    </button>
                </div>
            </div>
        );
    }

    private handleOnChagne = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = this.props;
        onChange(event.target.value);
    };
}
