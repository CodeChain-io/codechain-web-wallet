import * as React from "react";
import { NetworkId } from "../../model/address";
import { getServerHost } from "../network";
const Identicon = require("identicon.js");
const sha256 = require("js-sha256");

interface Props {
    data: string;
    className?: string;
    size: number;
    isAssetImage: boolean;
    networkId: NetworkId;
}
interface State {
    requestUrl?: string;
}

export class ImageLoader extends React.Component<Props, State> {
    // FIXME: Change the default host
    constructor(prop: Props) {
        super(prop);
        let requestUrl;
        if (prop.isAssetImage) {
            const host = getServerHost(prop.networkId || "tc");
            requestUrl = `${host}/api/asset/image/${prop.data}`;
        } else {
            requestUrl = this.getDefaultImage();
        }
        this.state = {
            requestUrl
        };
    }

    public render() {
        const { className, size } = this.props;
        const { requestUrl } = this.state;

        return (
            <img
                className={className}
                style={{ verticalAlign: "middle", width: size, height: size }}
                src={requestUrl}
                onError={this.fallback}
            />
        );
    }

    private getDefaultImage = () => {
        const hash = sha256.create();
        hash.update(this.props.data);
        const identiconData = new Identicon(
            hash.hex(),
            this.props.size
        ).toString();
        return `data:image/png;base64,${identiconData}`;
    };

    private fallback = () => {
        this.setState({ requestUrl: this.getDefaultImage() });
    };
}
