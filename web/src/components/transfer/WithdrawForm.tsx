"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { withdrawFromPool } from "@/lib/shielded/pool";
import { shortenAddress } from "@/lib/utils/format";

export function WithdrawForm() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [nullifierSecret, setNullifierSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleWithdraw = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage("Wallet not connected");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("Generating ZK proof and withdrawing...");

    try {
      const secretBytes = new Uint8Array(
        nullifierSecret.split(",").map((s) => parseInt(s.trim(), 10))
      );

      const signature = await withdrawFromPool(connection, { publicKey, signTransaction }, {
        nullifierSecret: secretBytes,
        amount: BigInt(amount),
        recipient: new PublicKey(recipient),
        recipientTokenAccount: new PublicKey(recipient),
        merkleProof: [],
      });

      setStatus("success");
      setMessage(`Withdrawn! TX: ${shortenAddress(signature)}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Withdrawal failed");
    }
  }, [publicKey, signTransaction, connection, amount, recipient, nullifierSecret]);

  return (
    <div className="rounded-xl bg-obscura-surface p-6 border border-obscura-surface-variant">
      <h2 className="text-xl font-semibold text-obscura-on-surface mb-4">Shielded Withdraw</h2>
      <p className="text-sm text-obscura-on-surface-variant mb-4">
        Withdraw from the shielded pool to a fresh address. ZK proof breaks the link.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Nullifier Secret</label>
          <input
            type="text"
            value={nullifierSecret}
            onChange={(e) => setNullifierSecret(e.target.value)}
            placeholder="Comma-separated bytes"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2 text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Fresh recipient address"
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
          onClick={handleWithdraw}
          disabled={status === "loading" || !publicKey}
          className="w-full rounded-lg bg-obscura-secondary px-4 py-3 text-obscura-dark font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {status === "loading" ? "Withdrawing..." : "Withdraw from Shielded Pool"}
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
