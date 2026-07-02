"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { depositToPool } from "@/lib/shielded/pool";
import { shortenAddress } from "@/lib/utils/format";
import { ArrowDown, Spinner } from "@phosphor-icons/react";

export function DepositForm() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [tokenMint, setTokenMint] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleDeposit = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage("Wallet not connected");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("Generating commitment and depositing...");

    try {
      const result = await depositToPool(connection, { publicKey, signTransaction }, {
        amount: BigInt(amount),
        tokenMint: new PublicKey(tokenMint),
        depositorTokenAccount: new PublicKey(tokenMint),
      });

      setStatus("success");
      setMessage(`Deposited! TX: ${shortenAddress(result.signature)}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Deposit failed");
    }
  }, [publicKey, signTransaction, connection, amount, tokenMint]);

  return (
    <div className="rounded-xl bg-obscura-surface border border-obscura-surface-variant overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-obscura-surface-variant">
        <ArrowDown size={16} weight="bold" className="text-obscura-primary" />
        <h2 className="text-sm font-semibold text-obscura-on-surface tracking-tight">Shielded Deposit</h2>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-xs text-obscura-on-surface-variant leading-relaxed">
          Deposit tokens into the shielded pool. A commitment is generated client-side using your nullifier secret.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Token Mint</label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Token mint address"
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

        <button
          onClick={handleDeposit}
          disabled={status === "loading" || !publicKey}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-obscura-primary px-4 py-3 text-sm font-semibold text-obscura-dark transition-all hover:brightness-110 active:scale-[0.98] active:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "loading" && <Spinner size={16} className="animate-spin" />}
          {status === "loading" ? "Depositing..." : "Deposit to Shielded Pool"}
        </button>

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
