export function getNetworkNameById(networkId: string) {
    switch (networkId) {
        case "cc":
            return "mainNet";
        case "tc":
            return "husky";
        case "sc":
            return "saluki";
        case "wc":
            return "corgi";
    }
    throw new Error("Unknown networkId");
}

export function getNetworkIdByAddress(address: string) {
    return address.slice(0, 2);
}
