import BigNumber from "bignumber.js";

export function changeQuarkToCCC(quark: BigNumber) {
    return quark.div(Math.pow(10, 9));
}
