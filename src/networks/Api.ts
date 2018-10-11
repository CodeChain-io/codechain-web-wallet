import axios from "axios";

// FIXME: Change the default host
const apiHost = process.env.APIHost || "https://husky.codechain.io:8081";

export async function getUTXOList(address: string) {
    return await axios.get(`${apiHost}/api/utxo/${address}`);
}
