import { WalletId } from "./connect";
import { MetamaskConnect } from "./metamask";
import { OkxConnect } from "./okx";


export function getWalletConnect(walletId: WalletId) {
  switch (walletId) {
    case WalletId.METAMASK:
      return new MetamaskConnect()
    case WalletId.OKX:
      return new OkxConnect()
    default:
      throw new Error(`Unknown wallet: ${walletId}`)
  }
}