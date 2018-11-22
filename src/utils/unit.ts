import { U256 } from "codechain-sdk/lib/core/classes";

export function changeQuarkToCCCString(quark: U256) {
    return quark.value.div(Math.pow(10, 9)).toString(10);
}
