import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import { WalletId } from "./connect";
import nacl from "tweetnacl";
import { useUserStore } from "@/store/user";

export class MetamaskConnect {
  id = WalletId.METAMASK;
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
      window.ethereum &&
      window.ethereum.isMetaMask
    ) {
      this.wallet = window.ethereum;

      this.checkStoredPublicKey();
    } else {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
  }

  checkStoredPublicKey() {
    const userStore = useUserStore.getState();
    if (userStore.publicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userStore.publicKey));
    this.address = userStore.address;
  }

  async connect() {
    await this.checkConnected();
    const response = await this.wallet.request({
      method: "eth_requestAccounts",
    });
    console.log("response", response);
    const publicKey = response?.[0];

    if (!publicKey) {
      throw new Error("Failed to connect");
    }

    this.address = publicKey;
    this.publicKey = ethers.toBeArray(publicKey);

    return this.publicKey;
  }

  async checkConnected() {
    await this.wallet.enable();
    if (!this.wallet.isConnected()) {
      await this.wallet.handleConnect();
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature: string = await this.wallet.request({
      method: "personal_sign",
      params: [hexMsg, this.address],
    });
    return ethers.getBytes(signature);
  }

  async verifySignature(
    message: string,
    signature: Uint8Array,
    signer: Uint8Array
  ): Promise<boolean> {
    const sigStr = ethers.hexlify(signature);
    const signerAddress = ethers.verifyMessage(message, sigStr);
    const expectedAddress = ethers.hexlify(signer);
    const isValid =
      signerAddress.toLowerCase() === expectedAddress.toLowerCase();
    return isValid;
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

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(this.publicKey);

    return transaction;
  }

  async signTransaction(transaction: Transaction): Promise<any> {
    await this.checkConnected();
    const signedTx = await this.wallet.solana.signTransaction(transaction);
    return signedTx;
  }

  async boardcastTransaction(signedTx: any) {
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
}
