import BigNumber from "bignumber.js";
import { ParcelDoc } from "codechain-indexer-types/lib/types";
import * as _ from "lodash";

export const getAggrPaymentParcel = (
    address: string,
    paymentParcelList: ParcelDoc[]
) =>
    _.reduce(
        paymentParcelList,
        (memo, paymentParcel: ParcelDoc) => {
            let output = new BigNumber(0);
            let input = new BigNumber(0);
            if (paymentParcel.action.action === "payment") {
                const amount = paymentParcel.action.amount;
                if (paymentParcel.action.receiver === address) {
                    output = output.plus(new BigNumber(amount));
                }
                if (paymentParcel.signer === address) {
                    input = input.plus(new BigNumber(amount));
                }
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
