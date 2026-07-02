"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { depositToPool } from "@/lib/shielded/pool";
import { shortenAddress } from "@/lib/utils/format";

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
    <div className="rounded-xl bg-obscura-surface p-6 border border-obscura-surface-variant">
      <h2 className="text-xl font-semibold text-obscura-on-surface mb-4">Shielded Deposit</h2>
      <p className="text-sm text-obscura-on-surface-variant mb-4">
        Deposit tokens into the shielded pool. A commitment is generated client-side.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Token Mint</label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Token mint address"
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
        <button
          onClick={handleDeposit}
          disabled={status === "loading" || !publicKey}
          className="w-full rounded-lg bg-obscura-primary px-4 py-3 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {status === "loading" ? "Depositing..." : "Deposit to Shielded Pool"}
        </button>
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
