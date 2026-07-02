"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { executePrivateSwap, getJupiterQuote, type JupiterQuote } from "@/lib/swap/jupiter";
import { shortenAddress, formatTokenAmount } from "@/lib/utils/format";

export function SwapInterface() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [inputMint, setInputMint] = useState("");
  const [outputMint, setOutputMint] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("50"); // 0.5%
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [status, setStatus] = useState<"idle" | "quoting" | "swapping" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleGetQuote = useCallback(async () => {
    if (!inputMint || !outputMint || !amount) {
      setMessage("Fill in all fields");
      setStatus("error");
      return;
    }

    setStatus("quoting");
    setMessage("Fetching Jupiter quote...");

    try {
      const q = await getJupiterQuote({
        inputMint: new PublicKey(inputMint),
        outputMint: new PublicKey(outputMint),
        amount: BigInt(amount),
        slippageBps: parseInt(slippage, 10),
      });
      setQuote(q);
      setStatus("idle");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Quote failed");
    }
  }, [inputMint, outputMint, amount, slippage]);

  const handleSwap = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage("Wallet not connected");
      setStatus("error");
      return;
    }

    setStatus("swapping");
    setMessage("Executing private swap via Helius Sender...");

    try {
      const result = await executePrivateSwap(connection, { publicKey, signTransaction }, {
        inputMint: new PublicKey(inputMint),
        outputMint: new PublicKey(outputMint),
        amount: BigInt(amount),
        slippageBps: parseInt(slippage, 10),
      });

      setStatus("success");
      setMessage(`Swap complete! TX: ${shortenAddress(result.signature)}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Swap failed");
    }
  }, [publicKey, signTransaction, connection, inputMint, outputMint, amount, slippage]);

  return (
    <div className="rounded-xl bg-obscura-surface p-6 border border-obscura-surface-variant">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Input Token Mint</label>
          <input
            type="text"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            placeholder="Input mint address"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2 text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              const tmp = inputMint;
              setInputMint(outputMint);
              setOutputMint(tmp);
            }}
            className="rounded-full bg-obscura-surface-variant px-4 py-2 text-obscura-on-surface-variant hover:text-obscura-primary"
          >
            ↓ Swap Direction
          </button>
        </div>

        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Output Token Mint</label>
          <input
            type="text"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            placeholder="Output mint address"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2 text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2 text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">
            Slippage ({parseFloat(slippage) / 100}%)
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="w-full accent-obscura-primary"
          />
        </div>

        {quote && (
          <div className="rounded-lg bg-obscura-dark p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-obscura-on-surface-variant">Expected Output</span>
              <span className="text-obscura-secondary">{quote.outAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-obscura-on-surface-variant">Price Impact</span>
              <span className="text-obscura-on-surface">{(quote.priceImpactPct * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGetQuote}
            disabled={status === "quoting"}
            className="flex-1 rounded-lg bg-obscura-surface-variant px-4 py-3 text-obscura-on-surface font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {status === "quoting" ? "Quoting..." : "Get Quote"}
          </button>
          <button
            onClick={handleSwap}
            disabled={status === "swapping" || !publicKey || !quote}
            className="flex-1 rounded-lg bg-obscura-primary px-4 py-3 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {status === "swapping" ? "Swapping..." : "Execute Swap"}
          </button>
        </div>

        {status === "success" && (
          <p className="text-sm text-obscura-success">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-obscura-error">{message}</p>
        )}
      </div>
    </div>
  );
}
