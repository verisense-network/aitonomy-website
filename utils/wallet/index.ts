import { WalletId } from "./connect";
import { OkxConnect } from "./okx";
import { PhantomConnect } from "./phantom";

export function getWalletConnect(walletId: WalletId) {
  switch (walletId) {
    case WalletId.OKX:
      return new OkxConnect();
    case WalletId.PHANTOM:
      return new PhantomConnect();
    default:
      throw new Error(`Unknown wallet: ${walletId}`);
  }
}
