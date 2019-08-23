import * as asset from "./asset.json";
import * as backup from "./backup.json";
import * as charge from "./charge.json";
import * as create_confirm from "./create/confirm.json";
import * as create_mnemonic from "./create/mnemonic.json";
import * as create_seed from "./create/seed.json";
import * as create_select from "./create/select.json";
import * as main from "./main.json";
import * as mint from "./mint.json";
import * as restore from "./restore.json";
import * as send_asset from "./send/asset.json";
import * as send_ccc from "./send/ccc.json";
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
    restore,
    send: {
        asset: send_asset,
        ccc: send_ccc
    },
    welcome,
    charge,
    asset,
    backup
};
