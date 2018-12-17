import MessageTunnel from "./MessageTunnel";
import WalletAPI from "./WalletAPI";

console.warn("Injecting Wallet-API to the window object");

const messageTunnel = new MessageTunnel({
  from: "wallet_inpage",
  to: "wallet_contentscript"
});

(window as any).walletAPI = new WalletAPI(messageTunnel);
