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

export async function signTransaction(
  wallet: Wallet,
  rpcURL: string,
  tx: Transaction
): Promise<string> {
  const user = await extractAccoutPrivateKey(wallet);


  const connection = new Connection(
    "https://api.devnet.solana.com/",
    "confirmed"
  );
  let blockhash = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash.blockhash;
  await sendAndConfirmTransaction(connection, tx, [user]);
  console.log("Transaction sent and confirmed");
  return "Transaction sent and confirmed";
}
