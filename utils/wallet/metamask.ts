import {
  BrowserProvider,
  ethers,
  JsonRpcProvider,
  TransactionRequest,
} from "ethers";
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk";
import { WalletId } from "./connect";
import { useUserStore } from "@/stores/user";

export class MetamaskConnect {
  id = WalletId.METAMASK;
  wallet: SDKProvider | undefined;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  sdk = new MetaMaskSDK({
    dappMetadata: {
      name: "Aitonomy",
      url: window.location.href,
    },
    injectProvider: true,
    infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
  });
  provider: BrowserProvider | null = null;
  jsonRpcProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );

  constructor() {
    this.sdk.init().then(() => {
      this.wallet = this.sdk.getProvider();
    });
    this.checkStoredPublicKey();
  }

  async checkStoredPublicKey() {
    const userStore = useUserStore.getState();
    if (userStore.publicKey.length === 0) return;
    this.publicKey = new Uint8Array(Object.values(userStore.publicKey));
    this.address = userStore.address;
    await this.checkConnected();
  }

  async connect() {
    if (!window.ethereum) {
      // open MetaMask App
      window.open(
        `https://metamask.app.link/dapp/${window.location.origin}`,
        "_blank"
      );
      return "Continue to MetaMask";
    }

    await this.sdk.init();
    const accounts = await this.sdk.connect();
    this.wallet = this.sdk.getProvider();
    const publicKey = accounts[0];

    if (!publicKey) {
      throw new Error("account not found");
    }

    if (!this.wallet) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
    if (!this.provider) {
      this.provider = new ethers.BrowserProvider(this.wallet);
    }

    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);

    const bscNetworkId = 56;

    if (chainId !== bscNetworkId) {
      try {
        await this.wallet.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await this.wallet.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x38",
                rpcUrls: ["https://bsc-dataseed.binance.org/"],
                chainName: "Binance Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://bscscan.com"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await this.provider.getSigner();

    this.address = await signer.getAddress();
    this.publicKey = ethers.toBeArray(this.address);

    return this.publicKey;
  }

  async checkConnected() {
    await this.sdk.init();
    await this.sdk.connect();
    this.wallet = this.sdk.getProvider();

    if (!this.wallet) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
    if (!this.wallet.isConnected()) {
      await this.sdk.connect();
    }
    if (!this.provider) {
      this.provider = new ethers.BrowserProvider(this.wallet);
    }

    if (window.ethereum && window.ethereum?.isPhantom) {
      throw new Error(
        "Phantom Wallet extension already exists. Please disable Phantom extension first."
      );
    } else if (!window.ethereum) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    if (!this.wallet) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature = await this.wallet.request({
      method: "personal_sign",
      params: [hexMsg, this.address],
    });
    if (!signature) {
      throw new Error("Signature not found");
    }
    return ethers.getBytes(signature as string);
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

  async createTransaction(
    toAddress: string,
    amount: string
  ): Promise<TransactionRequest> {
    await this.checkConnected();
    if (!this.provider) {
      throw new Error("Provider not found");
    }
    const tx: TransactionRequest = {
      to: ethers.getAddress(toAddress),
      value: ethers.parseEther(amount),
      chainId: 56,
    };
    return tx;
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    await this.checkConnected();
    if (!this.provider) {
      throw new Error("Provider not found");
    }
    const signer = await this.provider.getSigner();
    console.log("tx", tx);
    console.log("signer", signer);
    const sig = await signer.sendTransaction(tx);
    return sig.hash;
  }

  async broadcastTransaction(sigHash: string) {
    /**
     * BSC use sendTransaction broadcastTransaction
     */
    return sigHash;
  }

  async getFinalizedTransaction(txHash: string) {
    await this.checkConnected();
    const receipt = await this.jsonRpcProvider.waitForTransaction(txHash);
    return receipt;
  }
}
