export function getNetworkNameById(networkId: string) {
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

export function getNetworkIdByAddress(address: string) {
    return address.slice(0, 2);
}
