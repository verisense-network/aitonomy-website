import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletId } from "./connect";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { useUserStore } from "@/store/user";
import { chain } from "../chain";
import { BrowserProvider, ethers } from "ethers";

export class OkxConnect {
  id = WalletId.OKX;
  wallet: any;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  ethersProvider: BrowserProvider | null = null;
  solConnection: Connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=64dbe6d2-9641-43c6-bb86-0e3d748f31b1",
    "confirmed"
  );

  constructor() {
    if (
      typeof window !== "undefined" &&
      window.okxwallet &&
      window.okxwallet.isOkxWallet
    ) {
      this.wallet = window.okxwallet;

      this.checkStoredPublicKey();
    } else {
      throw new Error(
        "OKX Wallet extension not found. Please install it first."
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
    const response = await this.wallet.solana.connect();
    const publicKey = response.publicKey.toString();

    this.address = publicKey;
    this.publicKey = bs58.decode(publicKey);

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

  async createTransaction(
    toAddress: string,
    amount: string
  ): Promise<Transaction | ethers.Transaction> {
    await this.checkConnected();
    if (chain === "sol") {
      const transaction = new Transaction();

      const receiverAddress = new PublicKey(toAddress);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(this.publicKey),
          toPubkey: receiverAddress,
          lamports: Number(amount) / LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await this.solConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(this.publicKey);

      return transaction;
    } else {
      if (!this.ethersProvider) {
        throw new Error("Provider not found");
      }
      const tx = new ethers.Transaction();
      tx.to = toAddress;
      tx.value = ethers.parseEther(amount);
      tx.chainId = 56;

      const feeData = await this.ethersProvider.getFeeData();

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        tx.type = 2;
        tx.maxFeePerGas = feeData.maxFeePerGas;
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      } else {
        tx.type = 0;
        if (feeData.gasPrice) {
          tx.gasPrice = feeData.gasPrice;
        } else {
          tx.gasPrice = ethers.parseUnits("5", "gwei");
        }
      }

      tx.gasLimit = await this.ethersProvider.estimateGas({
        to: tx.to,
        from: this.address,
        value: tx.value,
      });
      return tx;
    }
  }

  async signTransaction(
    transaction: Transaction | ethers.Transaction
  ): Promise<any> {
    await this.checkConnected();
    if (chain === "sol") {
      const signedTx = await this.wallet.solana.signTransaction(transaction);
      return signedTx;
    } else if (chain === "bsc") {
      const signedTx = await this.wallet.ethers.signTransaction(transaction);
      return signedTx;
    }
  }

  async broadcastTransaction(signedTx: any) {
    const serializedTransaction = signedTx.serialize();
    const res = await this.solConnection.sendRawTransaction(
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
    if (chain === "sol") {
      const res = await this.solConnection.getTransaction(txHash, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
      });
      return res;
    } else if (chain === "bsc") {
      if (!this.ethersProvider) {
        throw new Error("Provider not found");
      }
      const res = await this.ethersProvider.waitForTransaction(txHash);
      return res;
    }
  }
}
