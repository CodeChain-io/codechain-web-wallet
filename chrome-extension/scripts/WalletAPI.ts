import { AggsUTXO } from "codechain-indexer-types/lib/types";
import { PlatformAddress } from "codechain-primitives/lib";
import {
  AssetTransferInput,
  AssetTransferTransaction,
  Parcel,
  SignedParcel,
  U256
} from "codechain-sdk/lib/core/classes";
import { NetworkId } from "codechain-sdk/lib/core/types";
import { getCodeChainHost, getIndexerHost } from "../../src/utils/network";
import MessageTunnel from "./MessageTunnel";

interface API {
  signTxInput: (
    assetTransferTransaction: AssetTransferTransaction,
    index: number
  ) => Promise<AssetTransferTransaction>;
  signParcel: (
    parcel: Parcel,
    options: {
      feePayer: string;
      fee: U256;
    }
  ) => Promise<SignedParcel>;
  getNetworkId: () => Promise<NetworkId>;
  getPlatformAddresses: () => Promise<string[]>;
  getAssetAddresses: () => Promise<string[]>;
  getAvailableAssets: (assetAddress: string) => Promise<AggsUTXO | null>;
  getAvailableQuark: (platformAddress: string) => Promise<U256 | null>;
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
    const response = await this.sendRequest<U256 | null>({
      type: "getAvailableQuark",
      body: {
        address: platformAddress
      }
    });
    return response;
  };

  public getAvailableAssets = async (assetAddress: string) => {
    const response = await this.sendRequest<AggsUTXO | null>({
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
    assetTransferTransaction: AssetTransferTransaction,
    index: number
  ) => {
    const response = await this.sendRequest<AssetTransferTransaction>({
      type: "signTxInput",
      body: {
        tx: assetTransferTransaction,
        index
      }
    });
    return response;
  };

  public signParcel = async (
    parcel: Parcel,
    options: {
      feePayer: string;
      fee: U256;
    }
  ) => {
    const response = await this.sendRequest<SignedParcel>({
      type: "signParcel",
      body: {
        parcel,
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
