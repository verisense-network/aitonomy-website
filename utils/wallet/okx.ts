import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletId } from "./connect";
import bs58 from "bs58";
import nacl from "tweetnacl";

export class OkxConnect {
  id = WalletId.OKX;
  wallet: any;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);

  constructor() {
    if (
      typeof window !== "undefined" &&
      window.okxwallet &&
      window.okxwallet.isOkxWallet
    ) {
      this.wallet = window.okxwallet;
    } else {
      throw new Error(
        "OKX Wallet extension not found. Please install it first."
      );
    }
  }

  async connect() {
    await this.checkConnected();
    const response = await this.wallet.solana.connect();
    const publicKey = response.publicKey.toString();

    this.address = publicKey;
    this.publicKey = bs58.decode(publicKey);

    return this.publicKey;
  }

  async checkConnected() {
    if (!this.wallet.isConnected()) {
      await this.wallet.handleConnect();
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    const encoded = new TextEncoder().encode(message);
    const { signature } = await this.wallet.solana.signMessage(encoded);
    return new Uint8Array(signature);
  }

  async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    const pubkey = new PublicKey(publicKey);

    const messageHash = new TextEncoder().encode(message);

    const isValid = nacl.sign.detached.verify(
      messageHash,
      signature,
      pubkey.toBytes()
    );

    return isValid;
  }

  setPublickey(publicKey: Uint8Array) {
    this.publicKey = publicKey;
  }

  async createTransaction(toAddress: PublicKey, lamports: number) {
    const transaction = new Transaction();

    const receiverAddress = new PublicKey(toAddress);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(this.publicKey),
        toPubkey: receiverAddress,
        lamports,
      })
    );

    const connection = new Connection("https://api.devnet.solana.com");

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(this.publicKey);

    return transaction;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    await this.checkConnected();
    return this.wallet.solana.signTransaction(transaction);
  }
}
