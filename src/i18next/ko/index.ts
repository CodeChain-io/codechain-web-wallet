import asset from "./asset.json";
import backup from "./backup.json";
import create_confirm from "./create/confirm.json";
import create_mnemonic from "./create/mnemonic.json";
import create_seed from "./create/seed.json";
import create_select from "./create/select.json";
import main from "./main.json";
import mint from "./mint.json";
import restore from "./restore.json";
import send_asset from "./send/asset.json";
import send_ccc from "./send/ccc.json";
import welcome from "./welcome.json";

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
    asset,
    backup
};
