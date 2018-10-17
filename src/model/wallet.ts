import { CCKey } from "codechain-keystore";
import * as FileSaver from "file-saver";

let dbType = "volatile";
if (process.env.CI) {
    dbType = "in-memory";
}

let ccKey: CCKey;
export async function createWallet() {
    ccKey = await CCKey.create({ dbType });
}

export async function clearWallet() {
    await ccKey.clear();
}

export async function saveWallet(name: string) {
    const text = await ccKey.save();
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    FileSaver.saveAs(blob, `${name}.wallet`);
}

export async function setWalletName(name: string) {
    const meta = await ccKey.getMeta();
    let newMeta;
    try {
        const parsedMeta = JSON.parse(meta);
        newMeta = Object.assign(parsedMeta, { name });
    } catch (e) {
        newMeta = { name };
    }
    await ccKey.setMeta(JSON.stringify(newMeta));
}

export async function createKey(
    type: "Platform" | "Asset",
    name: string,
    passphrase: string
) {
    if (type === "Platform") {
        await ccKey.platform.createKey({
            passphrase,
            meta: JSON.stringify({ name })
        });
    } else {
        await ccKey.asset.createKey({
            passphrase,
            meta: JSON.stringify({ name })
        });
    }
}

export async function loadWallet(walletText: string) {
    await ccKey.load(walletText);
}

export async function isWalletExisted() {
    return CCKey.exist({ dbType });
}
