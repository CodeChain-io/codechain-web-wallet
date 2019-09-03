import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { Form } from "reactstrap";
import ValidationInput from "../../ValidationInput/ValidationInput";
import "./LoginForm.css";

interface OwnProps {
    onChange: (passphrase: string) => void;
    onSignIn: () => void;
    passphrase: string;
    isValid?: boolean;
    username?: string | null;
}

type Props = WithTranslation & OwnProps;

class LoginForm extends React.Component<Props> {
    public render() {
        const { t, passphrase, isValid, username } = this.props;
        return (
            <Form className="login-form" onSubmit={this.handleOnFormSubmit}>
                <h4 className="welcome-text">
                    <Trans
                        i18nKey="welcome:title"
                        values={{ name: username ? username : "" }}
                    />
                </h4>
                <div className="passphrase-input-container">
                    <ValidationInput
                        onChange={this.handleOnChagne}
                        value={passphrase}
                        showValidation={true}
                        labelText={t("welcome:password")}
                        placeholder={t("welcome:password_placeholder")}
                        type="password"
                        isValid={isValid}
                        error={
                            isValid === false
                                ? (t("welcome:password_invalid") as string)
                                : undefined
                        }
                    />
                </div>
                <div>
                    <button
                        className="btn btn-primary square sign-in-btn"
                        type="submit"
                    >
                        <Trans i18nKey="welcome:signin" />
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

export default withTranslation()(LoginForm);
