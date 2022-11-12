import { Wallet } from "../interface";
import {
  getBIP44AddressKeyDeriver,
  JsonBIP44CoinTypeNode,
} from "@metamask/key-tree";
import { Keypair } from "@solana/web3.js";

export async function extractAccoutPrivateKey(
  wallet: Wallet
): Promise<Keypair> {
  // coin type for Solana
  // other coin types are : https://github.com/satoshilabs/slips/blob/master/slip-0044.md
  let coinType: number = 501;

  // requesting the BIP44 node from the wallet
  const methodName = `snap_getBip44Entropy_${coinType}`;
  const bitcoin44node = await wallet.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 501,
    },
  }) as JsonBIP44CoinTypeNode;

  // deriving the address as per mentioned in Solana Docs
  // https://docs.solana.com/wallet-guide/paper-wallet#hierarchical-derivation
  const addressKeyDeriver = await getBIP44AddressKeyDeriver(bitcoin44node//, {
    // account: 0,
    // change: 0,
  //}
  );
  const extendedPrivateKey = await addressKeyDeriver(0, true);
  const privateKey = extendedPrivateKey.privateKeyBuffer.slice(0, 32);

  // returning the keypair
  const keypair = Keypair.fromSeed(Uint8Array.from(privateKey));
  return keypair;
}

export async function getExtendedPublicKey(wallet: Wallet): Promise<Keypair> {
  const result = await wallet.request({
    method: "snap_confirm",
    params: [
      {
        prompt: "Access your extended public key?",
        description:
          "Do you want to allow this app to access your extended public key?",
      },
    ],
  });

  if (result) {
    let response = await extractAccoutPrivateKey(wallet);
    return response;
  } else {
    throw new Error("User reject to access the key");
  }
}
