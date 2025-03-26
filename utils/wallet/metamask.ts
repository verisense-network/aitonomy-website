import {
  BrowserProvider,
  ethers,
  JsonRpcProvider,
  TransactionRequest,
} from "ethers";
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk";
import { WalletId } from "./id";
import { useUserStore } from "@/stores/user";
import { isDev } from "../tools";
import { useAppearanceStore } from "@/stores/appearance";
import { updateAccountInfo } from "./connect";

const bscNetworkId = "0x38";
export class MetamaskConnect {
  id = WalletId.METAMASK;
  private static sdk: MetaMaskSDK | null = null;
  private static wallet: SDKProvider | undefined;
  static connecting = false;
  address: string = "";
  publicKey: Uint8Array = new Uint8Array(32);
  static provider =
    typeof window !== "undefined" && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : null;
  jsonRpcProvider: JsonRpcProvider = new ethers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org/"
  );
  accounts: string[] = [];

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
    const accounts = this.accounts?.length
      ? this.accounts
      : await MetamaskConnect.sdk!.connect();

    const address = accounts[0];

    if (!address) {
      throw new Error("account not found");
    }

    const provider = this.getProvider();
    if (!provider) {
      throw new Error("MetaMask provider not found");
    }

    this.address = address;
    this.publicKey = ethers.toBeArray(this.address);

    const chainId = MetamaskConnect.wallet!.getChainId();

    if (chainId !== bscNetworkId) {
      try {
        await MetamaskConnect.wallet!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: bscNetworkId }],
        });
      } catch (switchError: any) {
        console.log("switchError", switchError);
        if (switchError.code === 4902) {
          const res = await MetamaskConnect.wallet?.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: bscNetworkId,
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
    if (MetamaskConnect.connecting) {
      return false;
    }

    if (!MetamaskConnect.sdk?.isInitialized()) {
      const isMobile = useAppearanceStore.getState().isMobile;
      MetamaskConnect.connecting = true;
      MetamaskConnect.sdk = new MetaMaskSDK({
        dappMetadata: {
          name: "Aitonomy",
          url: window.location.origin,
        },
        injectProvider: true,
        infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
        useDeeplink: true,
        checkInstallationImmediately: true,
        checkInstallationOnAllCalls: true,
        preferDesktop: !isMobile,
        i18nOptions: {
          enabled: true,
        },
        logging: {
          developerMode: isDev,
        },
        storage: {
          enabled: true,
        },
      });
      await MetamaskConnect.sdk.init();
    }

    if (!MetamaskConnect.wallet?.isConnected()) {
      this.accounts = await MetamaskConnect.sdk!.connect();
      MetamaskConnect.wallet = MetamaskConnect.sdk!.getProvider();
    }

    await this.checkAccount();
    await this.switchChain();

    if (window.ethereum && window.ethereum?.isPhantom) {
      throw new Error(
        "Phantom Wallet extension already exists. Please disable Phantom extension first."
      );
    } else if (!window.ethereum) {
      throw new Error("MetaMask extension not found. Please install it first.");
    }

    MetamaskConnect.connecting = false;

    return true;
  }

  async checkAccount() {
    const account = MetamaskConnect.wallet!.getSelectedAddress();
    if (!account) {
      throw new Error("account not found");
    }
    this.address = account;
    this.publicKey = ethers.toBeArray(this.address);
  }

  async addListeners() {
    await this.checkConnected();

    MetamaskConnect.wallet?.on("accountsChanged", (accounts: any) => {
      console.log("accountsChanged", accounts);
      this.address = accounts[0];
      this.publicKey = ethers.toBeArray(this.address);

      updateAccountInfo({
        address: this.address,
        publicKey: this.publicKey,
      });
    });
  }

  getProvider() {
    if (!MetamaskConnect.provider) {
      MetamaskConnect.provider =
        typeof window !== "undefined" && window.ethereum
          ? new ethers.BrowserProvider(window.ethereum)
          : null;
    }
    return MetamaskConnect.provider;
  }

  async switchChain() {
    const chainId = MetamaskConnect.wallet!.getChainId();

    if (chainId !== bscNetworkId) {
      await MetamaskConnect.wallet!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: bscNetworkId }],
      });
    }
  }

  async signMessage(message: string): Promise<Uint8Array> {
    await this.checkConnected();

    const encoded = new TextEncoder().encode(message);
    const hexMsg = ethers.hexlify(encoded);
    const signature = await MetamaskConnect.wallet!.request({
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
    const tx: TransactionRequest = {
      to: ethers.getAddress(toAddress),
      from: ethers.getAddress(this.address),
      value: ethers.parseUnits(amount, "ether").toString(16),
    };
    return tx;
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    await this.checkConnected();

    const sig = await MetamaskConnect.wallet!.request({
      method: "eth_sendTransaction",
      params: [tx],
    });

    return sig as string;
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
