import { OnRpcRequestHandler } from "@metamask/snap-types";
import {
  getExtendedPublicKey,
  getPublicKey,
  signTransaction,
  sendTransaction,
} from "./rpc";
import { Wallet } from "./interface";

declare let wallet: Wallet;

export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case "getPublicExtendedKey":
      return getExtendedPublicKey(wallet);
    case "signTransaction":
      return signTransaction(wallet, request.params[0], request.params[1]);
    case "getPublicKey":
      return getPublicKey(wallet);
    case "sendTransaction":
      return sendTransaction(wallet);
    default:
      throw new Error("Method not found.");
  }
};
