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
      url: window.location.origin,
    },
    injectProvider: true,
    infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
    useDeeplink: true,
    checkInstallationOnAllCalls: true,
  });
  provider: BrowserProvider | null = null;
  jsonRpcProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );

  constructor() {
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
    await this.checkConnected();
    const accounts = await this.sdk.connect();
    console.log("accounts", accounts);
    const publicKey = accounts[0];
    console.log("publicKey", publicKey);

    if (!publicKey) {
      throw new Error("account not found");
    }

    if (!this.wallet) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }
    if (!this.provider) {
      this.provider = new ethers.BrowserProvider(this.wallet);
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await this.provider.getSigner();

    this.address = await signer.getAddress();
    this.publicKey = ethers.toBeArray(this.address);
    console.log("this.publicKey", this.publicKey);
    console.log("this.address", this.address);

    const chainId = this.wallet.getChainId();
    console.log("chainId", chainId);

    const bscNetworkId = "0x38";

    if (chainId !== bscNetworkId) {
      try {
        await this.wallet.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          const res = await this.wallet?.request({
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
          console.log("add bsc chain", res);
        } else {
          throw switchError;
        }
      }
    }

    return this.publicKey;
  }

  async checkConnected() {
    try {
      if (!this.sdk.isInitialized()) {
        await this.sdk.init();
      }
      console.log("isInitialized", this.sdk.isInitialized());
      if (!this.sdk.isExtensionActive) {
        return;
      }

      if (!this.wallet) {
        this.wallet = this.sdk.getProvider();
      }
      console.log("this.wallet", this.wallet);
      console.log("this.wallet.isConnected", this.wallet?.isConnected());
      if (!this.wallet?.isConnected()) {
        await this.sdk.connect();
      }
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(this.wallet as any);
      }

      if (window.ethereum && window.ethereum?.isPhantom) {
        throw new Error(
          "Phantom Wallet extension already exists. Please disable Phantom extension first."
        );
      } else if (!window.ethereum) {
        throw new Error(
          "MetaMask extension not found. Please install it first."
        );
      }
    } catch (error: any) {
      console.error("Error checking connection:", error);
      if (error.code === -32002) {
        throw new Error("Click Continue to connect");
      } else {
        throw error;
      }
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();
    console.log("this.wallet", this.wallet);
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
