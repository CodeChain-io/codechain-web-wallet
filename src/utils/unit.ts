import { U64 } from "codechain-sdk/lib/core/classes";

export function changeQuarkToCCCString(quark: U64) {
    return quark.value.div(Math.pow(10, 9)).toString(10);
}
