import { AggsUTXODoc } from "codechain-indexer-types";
import {
  SignedTransaction,
  Transaction,
  U64
} from "codechain-sdk/lib/core/classes";
import { NetworkId } from "codechain-sdk/lib/core/types";
import { getCodeChainHost, getIndexerHost } from "../../src/utils/network";
import MessageTunnel from "./MessageTunnel";

interface API {
  signTxInput: (
    assetTransferTransaction: Transaction,
    index: number
  ) => Promise<Transaction>;
  getNetworkId: () => Promise<NetworkId>;
  getPlatformAddresses: () => Promise<string[]>;
  getAssetAddresses: () => Promise<string[]>;
  getAvailableAssets: (assetAddress: string) => Promise<AggsUTXODoc | null>;
  getAvailableQuark: (platformAddress: string) => Promise<U64 | null>;
  getCodeChainNodeHost: (networkId: NetworkId) => Promise<string>;
  getIndexerHost: (networkId: NetworkId) => Promise<string>;
}

export default class WalletAPI implements API {
  private messageTunnel: MessageTunnel;
  constructor(messageTunnel: MessageTunnel) {
    this.messageTunnel = messageTunnel;
  }

  public isAuthenticated = async () => {
    const response = await this.sendRequest<boolean>({
      type: "isAuthenticated"
    });
    return response;
  };

  public getNetworkId = async () => {
    const response = await this.sendRequest<string>({
      type: "getNetworkId"
    });
    return response;
  };

  public getAvailableQuark = async (platformAddress: string) => {
    const response = await this.sendRequest<U64 | null>({
      type: "getAvailableQuark",
      body: {
        address: platformAddress
      }
    });
    return response;
  };

  public getAvailableAssets = async (assetAddress: string) => {
    const response = await this.sendRequest<AggsUTXODoc | null>({
      type: "getAvailableAssets",
      body: {
        address: assetAddress
      }
    });
    return response;
  };

  public getAssetAddresses = async () => {
    const response = await this.sendRequest<string[]>({
      type: "getAssetAddresses"
    });
    return response;
  };

  public getPlatformAddresses = async () => {
    const response = await this.sendRequest<string[]>({
      type: "getPlatformAddresses"
    });
    return response;
  };

  public signTxInput = async (
    assetTransferTransaction: Transaction,
    index: number
  ) => {
    const response = await this.sendRequest<Transaction>({
      type: "signTxInput",
      body: {
        tx: assetTransferTransaction,
        index
      }
    });
    return response;
  };

  public signTx = async (
    transaction: Transaction,
    options: {
      feePayer: string;
      fee: U64;
    }
  ) => {
    const response = await this.sendRequest<SignedTransaction>({
      type: "signTx",
      body: {
        transaction,
        options
      }
    });
    return response;
  };

  public getCodeChainNodeHost = (netowrkId: NetworkId) => {
    return getCodeChainHost(netowrkId);
  };

  public getIndexerHost = (networkId: NetworkId) => {
    return getIndexerHost(networkId);
  };

  private sendRequest = async <T>(param) => {
    const response = await this.messageTunnel.request<{
      status: string;
      data: T;
    }>(param);
    if (response.status !== "success") {
      throw new Error(response.status);
    }
    return response.data;
  };
}
