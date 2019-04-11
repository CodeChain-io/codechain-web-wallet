import * as charge from "./charge.json";
import * as create_confirm from "./create/confirm.json";
import * as create_mnemonic from "./create/mnemonic.json";
import * as create_seed from "./create/seed.json";
import * as create_select from "./create/select.json";
import * as main from "./main.json";
import * as mint from "./mint.json";
import * as send from "./send.json";
import * as welcome from "./welcome.json";

export default {
    create: {
        confirm: create_confirm,
        mnemonic: create_mnemonic,
        seed: create_seed,
        select: create_select
    },
    main,
    mint,
    send,
    welcome,
    charge
};
