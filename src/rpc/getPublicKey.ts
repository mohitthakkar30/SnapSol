import { extractAccoutPrivateKey } from "./getExtendedPublicKey";
import { Wallet } from "interface";

export async function getPublicKey(wallet: Wallet): Promise<string> {
  const user = await extractAccoutPrivateKey(wallet);

  return user.publicKey.toBase58();
}
