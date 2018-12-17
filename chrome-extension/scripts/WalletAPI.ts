import { AggsUTXO } from "codechain-indexer-types/lib/types";
import { PlatformAddress } from "codechain-primitives/lib";
import {
  AssetTransferInput,
  Parcel,
  SignedParcel,
  U256
} from "codechain-sdk/lib/core/classes";
import { NetworkId } from "codechain-sdk/lib/core/types";
import { getCodeChainHost, getIndexerHost } from "../../src/utils/network";
import MessageTunnel from "./MessageTunnel";

interface API {
  signTXInput: (tx: AssetTransferInput) => Promise<AssetTransferInput>;
  signParcel: (parcel: Parcel) => Promise<SignedParcel>;
  getNetworkId: () => Promise<NetworkId>;
  getPlatformAddresses: () => Promise<string[]>;
  getAssetAddresses: () => Promise<string[]>;
  getAvailableAssets: (assetAddress: string) => Promise<AggsUTXO | null>;
  getAvailableQuark: (platformAddress: string) => Promise<U256 | null>;
  getCodeChainNodeHost: (networkId: NetworkId) => Promise<string>;
  getIndexerHost: (networkId: NetworkId) => Promise<string>;
}

export default class WalletAPI implements API {
  public signTXInput: (tx: AssetTransferInput) => Promise<AssetTransferInput>;
  public signParcel: (parcel: Parcel) => Promise<SignedParcel>;
  public getPlatformAddresses: () => Promise<string[]>;
  public getAssetAddresses: () => Promise<string[]>;

  private messageTunnel: MessageTunnel;
  constructor(messageTunnel: MessageTunnel) {
    this.messageTunnel = messageTunnel;
  }

  public isAuthenticated = async () => {
    const response = await this.messageTunnel.request<boolean>({
      type: "isAuthenticated"
    });
    return response;
  };

  public getNetworkId = async () => {
    const response = await this.messageTunnel.request<string>({
      type: "getNetworkId"
    });
    return response;
  };

  public getAvailableQuark = async (platformAddress: string) => {
    const response = await this.messageTunnel.request<U256 | null>({
      type: "getAvailableQuark",
      body: {
        address: platformAddress
      }
    });
    return response;
  };

  public getAvailableAssets = async (assetAddress: string) => {
    const response = await this.messageTunnel.request<AggsUTXO | null>({
      type: "getAvailableAssets",
      body: {
        address: assetAddress
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
}
