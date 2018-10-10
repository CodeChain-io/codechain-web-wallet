import * as React from "react";
import { Form } from "reactstrap";

export interface Props {
    onConfirm: () => void;
}

export default class DownloadWalletForm extends React.Component<Props, any> {
    public render() {
        const { onConfirm } = this.props;
        return (
            <Form>
                <h4>Download wallet</h4>
                <div className="input-group d-flex justify-content-center">
                    <button type="button" className="btn btn-primary">
                        Download wallet file
                    </button>
                </div>
                <div className="d-flex button-container">
                    <button
                        type="button"
                        className="btn btn-secondary ml-auto"
                        onClick={onConfirm}
                    >
                        Done
                    </button>
                </div>
            </Form>
        );
    }
}
