import { NetworkId } from "codechain-sdk/lib/core/types";

export function getNetworkNameById(networkId: NetworkId) {
    switch (networkId) {
        case "cc":
            return "MAINNET";
        case "tc":
            return "HUSKY";
        case "sc":
            return "SALUKI";
        case "wc":
            return "CORGI";
    }
    throw new Error("Unknown networkId");
}

export function getServerHost(networkId: NetworkId) {
    return server.host[networkId];
}

export function getExplorerHost(networkId: NetworkId) {
    return server.host[networkId];
}

const server = {
    host: {
        cc: "https://husky.codechain.io/explorer",
        tc: "https://husky.codechain.io/explorer",
        sc: "https://saluki.codechain.io/explorer",
        wc: "https://corgi.codechain.io/explorer"
    },
    gateway: {
        cc: "https://husky.codechain.io/gateway",
        tc: "https://husky.codechain.io/gateway",
        sc: "https://saluki.codechain.io/gateway",
        wc: "https://corgi.codechain.io/gateway"
    }
};
