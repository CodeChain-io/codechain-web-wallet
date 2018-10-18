import BigNumber from "bignumber.js";

export function changeQuarkToCCC(quark: string) {
    return new BigNumber(quark).div(Math.pow(10, 9)).toString(10);
}
