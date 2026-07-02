"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { shieldedTransfer } from "@/lib/shielded/pool";
import { shortenAddress } from "@/lib/utils/format";

export function TransferForm() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [recipientCommitment, setRecipientCommitment] = useState("");
  const [amount, setAmount] = useState("");
  const [nullifierSecret, setNullifierSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleTransfer = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setMessage("Wallet not connected");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("Executing shielded transfer...");

    try {
      const secretBytes = new Uint8Array(
        nullifierSecret.split(",").map((s: string) => parseInt(s.trim(), 10))
      );
      const commitmentBytes = new Uint8Array(
        recipientCommitment.split(",").map((s: string) => parseInt(s.trim(), 10))
      );

      const signature = await shieldedTransfer(connection, { publicKey, signTransaction }, {
        nullifierSecret: secretBytes,
        amount: BigInt(amount),
        recipientCommitment: commitmentBytes,
      });

      setStatus("success");
      setMessage(`Transferred! TX: ${shortenAddress(signature)}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Transfer failed");
    }
  }, [publicKey, signTransaction, connection, amount, recipientCommitment, nullifierSecret]);

  return (
    <div className="rounded-xl bg-obscura-surface p-6 border border-obscura-surface-variant">
      <h2 className="text-xl font-semibold text-obscura-on-surface mb-4">Shielded Transfer</h2>
      <p className="text-sm text-obscura-on-surface-variant mb-4">
        Transfer within the shielded pool. Breaks sender-receiver link via ZK proofs.
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
          <label className="block text-sm text-obscura-on-surface-variant mb-1">Recipient Commitment</label>
          <input
            type="text"
            value={recipientCommitment}
            onChange={(e) => setRecipientCommitment(e.target.value)}
            placeholder="Comma-separated bytes"
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
          onClick={handleTransfer}
          disabled={status === "loading" || !publicKey}
          className="w-full rounded-lg bg-obscura-primary px-4 py-3 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {status === "loading" ? "Transferring..." : "Shielded Transfer"}
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
