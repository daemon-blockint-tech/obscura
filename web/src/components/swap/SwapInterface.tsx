"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { executePrivateSwap, getJupiterQuote, type JupiterQuote } from "@/lib/swap/jupiter";
import { shortenAddress } from "@/lib/utils/format";
import { ArrowDownUp, Spinner, Lightning } from "@phosphor-icons/react";

export function SwapInterface() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [inputMint, setInputMint] = useState("");
  const [outputMint, setOutputMint] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("50");
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
    <div className="rounded-xl bg-obscura-surface border border-obscura-surface-variant overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-obscura-surface-variant">
        <Lightning size={16} weight="fill" className="text-obscura-primary" />
        <h2 className="text-sm font-semibold text-obscura-on-surface tracking-tight">Swap Interface</h2>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Input Token Mint</label>
          <input
            type="text"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            placeholder="Input mint address"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2.5 text-sm font-mono text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary transition-colors"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              const tmp = inputMint;
              setInputMint(outputMint);
              setOutputMint(tmp);
            }}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-obscura-surface-variant bg-obscura-dark text-obscura-on-surface-variant hover:text-obscura-primary hover:border-obscura-primary transition-all active:scale-[0.98]"
          >
            <ArrowDownUp size={16} weight="bold" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Output Token Mint</label>
          <input
            type="text"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            placeholder="Output mint address"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2.5 text-sm font-mono text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2.5 text-sm font-mono text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">
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
          <div className="rounded-lg bg-obscura-dark border border-obscura-surface-variant p-4 divide-y divide-obscura-surface-variant/50">
            <div className="flex justify-between text-xs py-2">
              <span className="text-obscura-on-surface-variant">Expected Output</span>
              <span className="font-mono text-obscura-on-surface">{quote.outAmount}</span>
            </div>
            <div className="flex justify-between text-xs py-2">
              <span className="text-obscura-on-surface-variant">Price Impact</span>
              <span className="font-mono text-obscura-on-surface">{(quote.priceImpactPct * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGetQuote}
            disabled={status === "quoting"}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-obscura-surface-variant px-4 py-3 text-sm font-semibold text-obscura-on-surface transition-all hover:border-obscura-on-surface-variant active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "quoting" && <Spinner size={16} className="animate-spin" />}
            {status === "quoting" ? "Quoting..." : "Get Quote"}
          </button>
          <button
            onClick={handleSwap}
            disabled={status === "swapping" || !publicKey || !quote}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-obscura-primary px-4 py-3 text-sm font-semibold text-obscura-dark transition-all hover:brightness-110 active:scale-[0.98] active:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "swapping" && <Spinner size={16} className="animate-spin" />}
            {status === "swapping" ? "Swapping..." : "Execute Swap"}
          </button>
        </div>

        {status === "success" && (
          <p className="text-xs text-obscura-success font-mono">{message}</p>
        )}
        {status === "error" && (
          <p className="text-xs text-obscura-error font-mono">{message}</p>
        )}
      </div>
    </div>
  );
}
