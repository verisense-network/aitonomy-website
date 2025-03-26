import { WalletId } from "./id";
import { useUserStore } from "@/stores/user";
import {
  BrowserProvider,
  ethers,
  JsonRpcProvider,
  TransactionRequest,
} from "ethers";
import { CHAIN } from "../chain";
import {
  OKXUniversalProvider,
  SessionTypes,
} from "@okxconnect/universal-provider";
import { updateAccountInfo } from "./connect";

const bscNetworkId = "eip155:56";
export class OkxAppConnect {
  id = WalletId.OKX;
  private static wallet: OKXUniversalProvider | null = null;
  static connecting = false;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  ethersProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );
  browserProvider: BrowserProvider | null = null;
  session: SessionTypes.Struct | null = null;

  constructor() {
    this.checkStoredPublicKey();
  }

  async checkStoredPublicKey() {
    const userStore = useUserStore.getState();
    if (userStore.publicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userStore.publicKey));
    this.address = userStore.address;
  }

  async connect() {
    await this.checkConnected();
    if (!OkxAppConnect.wallet) {
      throw new Error("OKX SDK initialized failed. Please reload page.");
    }
    const session = this.session || (await this.getSession());
    if (!session) {
      throw new Error("get session failed");
    }
    this.session = session;

    const address = session.namespaces.eip155.accounts[0].split(":").pop()!;
    if (!address) {
      throw new Error("Failed to get address");
    }

    this.address = address;
    this.publicKey = ethers.toBeArray(address);

    if (!this.publicKey) {
      throw new Error("get session publickey failed");
    }

    const chainId = Number(
      await OkxAppConnect.wallet.request({
        method: "eth_chainId",
      })
    );

    if (chainId !== 56) {
      try {
        await OkxAppConnect.wallet.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await OkxAppConnect.wallet.request({
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

    return this.publicKey;
  }

  async checkConnected() {
    if (OkxAppConnect.connecting) {
      return false;
    }
    let provider: OKXUniversalProvider | null = OkxAppConnect.wallet;
    if (!OkxAppConnect.connecting && !OkxAppConnect.wallet) {
      OkxAppConnect.connecting = true;
      provider = await OKXUniversalProvider.init({
        dappMetaData: {
          name: "Aitonomy",
          manifestUrl: "https://aitonomy-website.vercel.app/",
          icon: "https://aitonomy-website.vercel.app/icon.ico",
        },
      });
      OkxAppConnect.wallet = provider;
      provider.on("session_delete", ({ topic }: { topic: string }) => {
        console.log("topic", topic);
      });
    }
    const connected = provider?.connected();
    if (!connected) {
      const session = await this.getSession(provider!);
      if (!session) {
        throw new Error("get session failed");
      }
      const address = session.namespaces.eip155.accounts[0].split(":").pop();
      if (!address) {
        throw new Error("get address failed");
      }
      this.session = session;
    }

    if (!this.browserProvider) {
      this.browserProvider = new ethers.BrowserProvider(provider!);
    }
    OkxAppConnect.connecting = false;
    return true;
  }

  async addListeners() {
    await this.checkConnected();

    OkxAppConnect.wallet!.on(
      "session_update",
      (session: SessionTypes.Struct) => {
        this.session = session;
        console.log("session_update", session);
        this.address = session.namespaces.eip155.accounts[0].split(":").pop()!;
        this.publicKey = ethers.toBeArray(this.address);

        updateAccountInfo({
          address: this.address,
          publicKey: this.publicKey,
        });
      }
    );
  }

  async getSession(provider?: OKXUniversalProvider) {
    return await (provider || OkxAppConnect.wallet!).connect({
      namespaces: {
        eip155: {
          chains: ["eip155:56"],
          defaultChain: "56",
        },
      },
      optionalNamespaces: {},
      sessionConfig: {},
    });
  }

  async signMessage(message: string): Promise<Uint8Array> {
    const connected = await this.checkConnected();
    if (!connected) {
      throw new Error("not connected");
    }
    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature: string = await OkxAppConnect.wallet!.request(
      {
        method: "personal_sign",
        params: [hexMsg, this.address],
      },
      bscNetworkId
    );
    return ethers.getBytes(signature);
  }

  async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): Promise<boolean> {
    const sigStr = ethers.hexlify(signature);
    const signerAddress = ethers.verifyMessage(message, sigStr);
    const expectedAddress = ethers.hexlify(publicKey);
    const isValid =
      signerAddress.toLowerCase() === expectedAddress.toLowerCase();
    return isValid;
  }

  async createTransaction(
    toAddress: string,
    amount: string
  ): Promise<TransactionRequest> {
    await this.checkConnected();
    const tx: TransactionRequest = {
      to: ethers.getAddress(toAddress),
      from: ethers.getAddress(this.address),
      value: ethers.parseUnits(amount, "ether").toString(16),
    };
    return tx;
  }

  async signTransaction(transaction: TransactionRequest): Promise<any> {
    await this.checkConnected();
    if (!OkxAppConnect.wallet) {
      throw new Error("OKX SDK initialized failed. Please reload page.");
    }
    const signedTx = await OkxAppConnect.wallet!.request(
      {
        method: "eth_sendTransaction",
        params: [transaction],
      },
      bscNetworkId
    );
    return signedTx;
  }

  async broadcastTransaction(signedTx: any) {
    if (CHAIN === "SOL") {
      // const serializedTransaction = signedTx.serialize();
      // const res = await this.solConnection.sendRawTransaction(
      //   serializedTransaction,
      //   {
      //     skipPreflight: false,
      //     preflightCommitment: "confirmed",
      //   }
      // );
      // return res;
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
      // const res = await this.solConnection.getTransaction(txHash, {
      //   commitment: "finalized",
      //   maxSupportedTransactionVersion: 0,
      // });
      // return res;
    } else if (CHAIN === "BSC") {
      if (!this.ethersProvider) {
        throw new Error("Provider not found");
      }
      const res = await this.ethersProvider.waitForTransaction(txHash);
      return res;
    }
  }

  async callWithdraw(
    contractAddress: string,
    messageBytes: string,
    signature: string
  ) {
    try {
      await this.checkConnected();

      const abi = ["function withdraw(bytes _messageBytes, bytes _signature)"];
      const signer = await this.browserProvider?.getSigner();

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.withdraw(messageBytes, signature);
      console.log("Transaction sent:", tx);

      const receipt = await tx.wait(); // 等待交易完成
      console.log("Transaction receipt:", receipt);

      return receipt;
    } catch (error: any) {
      console.error("Error sending contract transaction:", error);
      throw new Error(error);
    }
  }
}
