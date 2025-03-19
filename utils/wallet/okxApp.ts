import { WalletId } from "./id";
import { useUserStore } from "@/stores/user";
import { ethers, JsonRpcProvider, TransactionRequest } from "ethers";
import { CHAIN } from "../chain";
import { OKXUniversalProvider } from "@okxconnect/universal-provider";

let okxProvider: OKXUniversalProvider | null = null;

const bscNetworkId = "eip155:56";

export const getOkxProvider = async () => {
  if (okxProvider) return okxProvider;
  const provider = await OKXUniversalProvider.init({
    dappMetaData: {
      name: "Aitonomy",
      manifestUrl: "https://aitonomy-website.vercel.app/",
      icon: "https://aitonomy-website.vercel.app/icon.ico",
    },
  });
  okxProvider = provider;
  okxProvider.on("session_update", (session: any) => {
    console.log("session", session);
  });
  okxProvider.on("session_delete", ({ topic }: { topic: string }) => {
    console.log("topic", topic);
  });
  return provider;
};

let accountSession: {
  publicKey: Uint8Array;
  address: string;
} | null = null;

export const getSession = async () => {
  const provider = await getOkxProvider();
  if (!provider) {
    throw new Error("OKX SDK initialized failed. Please reload page.");
  }
  if (accountSession && provider.connected()) return accountSession;

  const session = await provider.connect({
    namespaces: {
      eip155: {
        chains: ["eip155:56"],
        defaultChain: "56",
      },
    },
    optionalNamespaces: {},
    sessionConfig: {},
  });
  if (!session) {
    throw new Error("Failed to connect");
  }
  const address = session.namespaces.eip155.accounts[0].split(":").pop();
  if (!address) {
    throw new Error("Failed to get address");
  }
  accountSession = {
    publicKey: ethers.toBeArray(address!),
    address: address!,
  };
  return accountSession;
};

export class OkxAppConnect {
  id = WalletId.OKX;
  wallet: OKXUniversalProvider | null = null;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  ethersProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );

  constructor() {
    this.checkConnected();
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
    console.log("connect");
    if (!this.wallet) {
      throw new Error("OKX SDK initialized failed. Please reload page.");
    }
    console.log("call getSession");
    const response = await getSession();

    console.log("response", response);

    const publicKey = response?.publicKey;

    if (!publicKey) {
      throw new Error("get session publickey failed");
    }

    const chainId = Number(
      await this.wallet.request({
        method: "eth_chainId",
      })
    );
    console.log("chainId", chainId);

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

    this.address = response.address;
    this.publicKey = publicKey;

    return this.publicKey;
  }

  async checkConnected() {
    try {
      if (!this.wallet) {
        const provider = await getOkxProvider();
        this.wallet = provider;
      }
      console.log("connected", this.wallet.connected());
      if (!this.wallet.connected()) {
        const session = await getSession();
        console.log("connected session", session);
        if (!session) {
          throw new Error("Failed to connect");
        }
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to initialize OKX Universal Provider");
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature: string = await this.wallet!.request(
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
    if (!this.wallet) {
      throw new Error("OKX SDK initialized failed. Please reload page.");
    }
    const signedTx = await this.wallet!.request(
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
}
