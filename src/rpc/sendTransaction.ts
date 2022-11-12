import { extractAccoutPrivateKey } from "./getExtendedPublicKey";
import { Wallet } from "../interface";
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

export async function sendTransaction(wallet: Wallet): Promise<string> {
  const user = await extractAccoutPrivateKey(wallet);

  const connection = new Connection(
    "https://solana-devnet.g.alchemy.com/v2/2Eys9o9XLKpPT5cWYqW0xKC_BPQXlocn",
    "confirmed"
  );

  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: user.publicKey,
      toPubkey: new PublicKey("51PmmJ9kNKqf2SNkEqxqkPPNHgEBDeSuUTNkba158jh3"),
      lamports: 1 * LAMPORTS_PER_SOL,
    })
  );

  const response = await sendAndConfirmTransaction(
    connection,
    transferTransaction,
    [user]
  );
  return response;
}
