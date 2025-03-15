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
import { useUserStore } from "@/stores/user";
import { CHAIN } from "../chain";
import { BrowserProvider, ethers, TransactionRequest } from "ethers";

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
  isOkxWallet: boolean = false;

  constructor() {
    this.isOkxWallet =
      typeof window !== "undefined" &&
      window.okxwallet &&
      window.okxwallet.isOkxWallet;
    if (this.isOkxWallet) {
      this.wallet = window.okxwallet;

      this.checkStoredPublicKey();
    } else {
      throw new Error(
        "OKX Wallet extension not found. Please install it first."
      );
    }
  }

  async checkStoredPublicKey() {
    const userStore = useUserStore.getState();
    if (userStore.publicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userStore.publicKey));
    this.address = userStore.address;
    await this.checkConnected();
  }

  async connect() {
    await this.checkConnected();
    console.log("connect", await this.wallet);
    let publicKey: string = "";
    if (CHAIN === "SOL") {
      const response = await this.wallet.solana.connect();
      publicKey = response.publicKey.toString();

      this.address = publicKey;
      this.publicKey = bs58.decode(publicKey);
    } else {
      const response = await this.wallet.request({
        method: "eth_requestAccounts",
      });

      const publicKey = response?.[0];

      if (!publicKey) {
        throw new Error("Failed to connect");
      }
      if (!this.ethersProvider) {
        this.ethersProvider = new ethers.BrowserProvider(window.ethereum);
      }

      const network = await this.ethersProvider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== 56) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x38",
                  chainName: "Binance Smart Chain",
                  nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18,
                  },
                  rpcUrls: ["https://bsc-dataseed.binance.org/"],
                  blockExplorerUrls: ["https://bscscan.com/"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const signer = await this.ethersProvider.getSigner();

      this.address = await signer.getAddress();
      this.publicKey = ethers.toBeArray(this.address);
    }

    return this.publicKey;
  }

  async checkConnected() {
    if (!this.wallet || !this.isOkxWallet) {
      throw new Error(
        "OKX Wallet extension not found. Please install it first."
      );
    }
    await this.wallet.enable();
    if (!this.wallet.isConnected()) {
      await this.wallet.handleConnect();
    }
    if (!this.ethersProvider) {
      this.ethersProvider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    if (CHAIN === "SOL") {
      const encoded = new TextEncoder().encode(message);
      const { signature } = await this.wallet.solana.signMessage(encoded);
      return new Uint8Array(signature);
    } else {
      const encoded = new TextEncoder().encode(message);
      const hexMsg = ethers.hexlify(encoded);
      const signature: string = await this.wallet.request({
        method: "personal_sign",
        params: [hexMsg, this.address],
      });
      return ethers.getBytes(signature);
    }
  }

  async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    if (CHAIN === "SOL") {
      const pubkey = new PublicKey(publicKey);

      const messageHash = new TextEncoder().encode(message);

      const isValid = nacl.sign.detached.verify(
        messageHash,
        signature,
        pubkey.toBytes()
      );

      return isValid;
    } else {
      const sigStr = ethers.hexlify(signature);
      const signerAddress = ethers.verifyMessage(message, sigStr);
      const expectedAddress = ethers.hexlify(publicKey);
      const isValid =
        signerAddress.toLowerCase() === expectedAddress.toLowerCase();
      return isValid;
    }
  }

  async createTransaction(
    toAddress: string,
    amount: string
  ): Promise<Transaction | TransactionRequest> {
    await this.checkConnected();
    if (CHAIN === "SOL") {
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
      const tx: TransactionRequest = {
        to: ethers.getAddress(toAddress),
        value: ethers.parseEther(amount),
        chainId: 56,
      };
      return tx;
    }
  }

  async signTransaction(
    transaction: Transaction | TransactionRequest
  ): Promise<any> {
    await this.checkConnected();
    if (CHAIN === "SOL") {
      const signedTx = await this.wallet.solana.signTransaction(transaction);
      return signedTx;
    } else if (CHAIN === "BSC") {
      if (!this.ethersProvider) {
        throw new Error("Provider not found");
      }
      const signer = await this.ethersProvider.getSigner();
      console.log("tx", transaction);
      console.log("signer", signer);
      const sig = await signer.sendTransaction(
        transaction as TransactionRequest
      );
      return sig.hash;
    }
  }

  async broadcastTransaction(signedTx: any) {
    if (CHAIN === "SOL") {
      const serializedTransaction = signedTx.serialize();
      const res = await this.solConnection.sendRawTransaction(
        serializedTransaction,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );
      return res;
    } else {
      /**
       * BSC use sendTransaction broadcastTransaction
       */
      return signedTx;
    }
  }

  async getFinalizedTransaction(txHash: string) {
    await this.checkConnected();
    if (CHAIN === "SOL") {
      const res = await this.solConnection.getTransaction(txHash, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
      });
      return res;
    } else if (CHAIN === "BSC") {
      if (!this.ethersProvider) {
        throw new Error("Provider not found");
      }
      const res = await this.ethersProvider.waitForTransaction(txHash);
      return res;
    }
  }
}
