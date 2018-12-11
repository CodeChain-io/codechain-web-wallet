import BigNumber from "bignumber.js";
import { ParcelDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";

export const getAggsParcel = (address: string, parcelList: ParcelDoc[]) =>
    _.reduce(
        parcelList,
        (memo, parcel: ParcelDoc) => {
            let output = new BigNumber(0);
            let input = new BigNumber(0);
            if (parcel.action.action === "payment") {
                const amount = parcel.action.amount;
                if (parcel.action.receiver === address) {
                    output = output.plus(new BigNumber(amount));
                }
                if (parcel.signer === address) {
                    input = input.plus(new BigNumber(amount));
                }
            }
            if (parcel.signer === address) {
                const fee = parcel.fee;
                input = input.plus(new BigNumber(fee));
            }
            return {
                input: memo.input.plus(input),
                output: memo.output.plus(output)
            };
        },
        {
            input: new BigNumber(0),
            output: new BigNumber(0)
        }
    );
