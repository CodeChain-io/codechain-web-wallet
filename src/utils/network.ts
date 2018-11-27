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
