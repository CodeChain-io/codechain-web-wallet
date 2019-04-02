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

export function getIndexerHost(networkId: NetworkId) {
    return server.indexer[networkId];
}

export function getExplorerHost(networkId: NetworkId) {
    return server.indexer[networkId];
}

export function getCodeChainHost(networkId: NetworkId) {
    return server.chain[networkId];
}

const server = {
    indexer: {
        cc: "https://explorer.codechain.io",
        tc: "https://husky.codechain.io/explorer",
        sc: "https://saluki.codechain.io/explorer",
        wc: "https://corgi.codechain.io/explorer"
    },
    chain: {
        cc: "https://13.209.251.3:8080",
        tc: "https://52.79.108.1:8080",
        sc: "https://52.78.210.78:8080",
        wc: "https://13.124.96.177:8080"
    }
};
