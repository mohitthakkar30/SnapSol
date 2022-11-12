export interface GetPublicExtendedKeyRequest {
  method: "getPublicExtendedKey";
  params: [];
}

export type MetamaskSolRpcRequest = GetPublicExtendedKeyRequest;

export type SolMethodCallback = (
  originString: string,
  requestObject: MetamaskSolRpcRequest
) => Promise<unknown>;

export interface Wallet {
  registerRpcMessageHandler: (fn: SolMethodCallback) => unknown;
  request(options: { method: string; params?: unknown[] }): Promise<unknown>;
}
