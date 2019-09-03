import React from "react";
import "./NotFound.css";

export default class NotFound extends React.Component<any, any> {
    public render() {
        return (
            <div id="Not-found">
                <div className="not-found">
                    <div className="not-found-404">
                        <h3>Oops! Page not found</h3>
                        <h1>
                            <span>4</span>
                            <span>0</span>
                            <span>4</span>
                        </h1>
                    </div>
                    <h2>
                        we are sorry, but the page you requested was not found
                    </h2>
                </div>
            </div>
        );
    }
}
