import { Connection, sendAndConfirmRawTransaction, Transaction } from "@solana/web3.js";
import { RPC_URL, SENDER_URL } from "../solana/rpc";

/// Helius Sender: Submit transactions via multi-path routing (Helius + Jito + SWQOS)
/// for lowest latency and highest landing rate.
/// POST https://sender.helius-rpc.com/fast

interface SenderResponse {
  signature: string;
}

/// Submit a serialized transaction via Helius Sender.
/// Requires a tip (min 0.001 SOL for Sender Max, 0.000005 SOL for SWQOS-only).
export async function submitViaSender(
  serializedTx: Buffer | Uint8Array
): Promise<string> {
  const base64Tx = Buffer.from(serializedTx).toString("base64");

  const response = await fetch(SENDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: base64Tx }),
  });

  if (!response.ok) {
    throw new Error(`Sender error: ${response.status} ${await response.text()}`);
  }

  const data: SenderResponse = await response.json();
  return data.signature;
}

/// Submit a transaction via Helius Sender with fallback to standard RPC.
export async function submitTransactionWithFallback(
  tx: Transaction,
  connection: Connection
): Promise<string> {
  try {
    const serialized = tx.serialize();
    return await submitViaSender(serialized);
  } catch (senderError) {
    console.warn("Helius Sender failed, falling back to RPC:", senderError);
    return await sendAndConfirmRawTransaction(
      connection,
      tx.serialize()
    );
  }
}

/// Helius Sender tip accounts.
/// These are the accounts that receive tips for transaction priority.
export const SENDER_TIP_ACCOUNTS = [
  "4ACfpUFoaSD9bfPdeu6DBt89gB6ENTeHBXCAi87NhDEE",
  "DttVt5N6fK2tYy2s3W2tKqXqW3W3W3W3W3W3W3W3W3",
];
