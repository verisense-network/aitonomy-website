import { WalletId } from "./connect";

export class MetamaskConnect {
  id = WalletId.METAMASK;
  wallet: any;
  address: string = "";
  publicKey: string = "";
  publicKeyBuffer: Buffer = Buffer.alloc(32)

  constructor() {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask
    ) {
      this.wallet = window.ethereum;
    } else {
      throw new Error(
        "Metamask Wallet extension not found. Please install it first."
      );
    }
  }

  async connect() {
    await this.checkConnected();

    const accounts = await this.wallet.request({
      method: "eth_requestAccounts",
    });

    if (!accounts.length) {
      throw new Error("User denied account access");
    }

    const selectedAddress = accounts[0];

    const publicKey = await this.wallet.request({
      method: "eth_getEncryptionPublicKey",
      params: [selectedAddress],
    });

    console.log("publicKey", publicKey)

    this.address = selectedAddress;
    this.publicKey = publicKey;
    this.publicKeyBuffer = Buffer.from(publicKey, 'base64');

    return this.publicKey
  }

  async checkConnected() {
    console.log("this.wallet", this.wallet)
    /**
     * metamask lock check
     */
    await this.wallet.enable();
    if (!this.wallet.isConnected()) {
      await this.wallet.handleConnect();
    }
  }

  async signMessage(message: string, address: string): Promise<string> {
    await this.checkConnected()
    const signature = await this.wallet.request({
      method: "personal_sign",
      params: [message, address],
    });

    return signature
  }

  async signPayload(payload: Record<string, any>, address: string): Promise<string> {
    const message = JSON.stringify(payload)
    return this.signMessage(message, address)
  }
}
