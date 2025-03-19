import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { useUserStore } from "@/stores/user";
import { WalletId } from "./id";

export class PhantomConnect {
  id = WalletId.PHANTOM;
  wallet: any;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  connection: Connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=64dbe6d2-9641-43c6-bb86-0e3d748f31b1",
    "confirmed"
  );

  constructor() {
    if (
      typeof window !== "undefined" &&
      window.solana &&
      window.solana.isPhantom
    ) {
      this.wallet = window.solana;

      this.checkStoredPublicKey();
    } else {
      throw new Error(
        "Phantom Wallet extension not found. Please install it first."
      );
    }
  }

  checkStoredPublicKey() {
    const userPublicKey = useUserStore.getState().publicKey;
    if (userPublicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userPublicKey));
  }

  async connect() {
    await this.checkConnected();
    const response = await this.wallet.connect();
    const publicKey = response.publicKey.toString();

    this.address = publicKey;
    this.publicKey = bs58.decode(publicKey);

    return this.publicKey;
  }

  async checkConnected() {
    if (!this.wallet.isConnected) {
      await this.wallet.connect();
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    const encoded = new TextEncoder().encode(message);
    const { signature } = await this.wallet.signMessage(encoded, "utf8");
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

  async createTransaction(toAddress: string, amount: string) {
    const transaction = new Transaction();

    const receiverAddress = new PublicKey(toAddress);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(this.publicKey),
        toPubkey: receiverAddress,
        lamports: Number(amount) / LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(this.publicKey);

    return transaction;
  }

  async signTransaction(transaction: Transaction): Promise<any> {
    await this.checkConnected();
    const signedTx = await this.wallet.signTransaction(transaction);
    return signedTx;
  }

  async broadcastTransaction(signedTx: any) {
    const serializedTransaction = signedTx.serialize();
    const res = await this.connection.sendRawTransaction(
      serializedTransaction,
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );
    return res;
  }

  async getFinalizedTransaction(txHash: string) {
    await this.checkConnected();
    const res = await this.connection.getTransaction(txHash, {
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
    });
    return res;
  }
}
