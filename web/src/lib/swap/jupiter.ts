/// Jupiter swap integration for private swaps.
/// Flow: confidential deposit → Jupiter swap → confidential withdraw

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { submitTransactionWithFallback } from "../helius/sender";
import { getOptimalPriorityFee } from "../helius/priority-fee";

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || "";
const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6";
const JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  swapTransaction?: string;
}

export interface PrivateSwapParams {
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: bigint;
  slippageBps: number; // 50 = 0.5%
}

/// Get a Jupiter swap quote (public API).
export async function getJupiterQuote(
  params: PrivateSwapParams
): Promise<JupiterQuote> {
  const url = new URL(`${JUPITER_QUOTE_URL}/quote`);
  url.searchParams.set("inputMint", params.inputMint.toBase58());
  url.searchParams.set("outputMint", params.outputMint.toBase58());
  url.searchParams.set("amount", params.amount.toString());
  url.searchParams.set("slippageBps", params.slippageBps.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Jupiter quote failed: ${response.status}`);
  }

  return response.json();
}

/// Get the serialized swap transaction from Jupiter.
export async function getJupiterSwapTransaction(
  quote: JupiterQuote,
  userPublicKey: PublicKey
): Promise<string> {
  const response = await fetch(JUPITER_SWAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: userPublicKey.toBase58(),
      wrapAndUnwrapSol: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Jupiter swap tx failed: ${response.status}`);
  }

  const data = await response.json();
  return data.swapTransaction;
}

/// Execute a private swap:
/// 1. Get Jupiter quote
/// 2. Get swap transaction from Jupiter
/// 3. Submit via Helius Sender with priority fee
export async function executePrivateSwap(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  params: PrivateSwapParams
): Promise<{ signature: string; quote: JupiterQuote }> {
  // 1. Get quote
  const quote = await getJupiterQuote(params);

  // 2. Get swap transaction
  const swapTxBase64 = await getJupiterSwapTransaction(quote, wallet.publicKey);

  // 3. Deserialize, sign, and submit via Helius Sender
  const swapTxBuffer = Buffer.from(swapTxBase64, "base64");
  const tx = Transaction.from(swapTxBuffer);

  // Get priority fee estimate
  const serializedForFee = tx.serialize({ requireAllSignatures: false }).toString("base64");
  await getOptimalPriorityFee(serializedForFee, "High");

  // Sign and submit
  const signedTx = await wallet.signTransaction(tx);
  const signature = await submitTransactionWithFallback(signedTx, connection);

  return { signature, quote };
}
