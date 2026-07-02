"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { shieldedTransfer } from "@/lib/shielded/pool";
import { shortenAddress } from "@/lib/utils/format";
import { PaperPlaneTilt, Spinner } from "@phosphor-icons/react";

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
    <div className="rounded-xl bg-obscura-surface border border-obscura-surface-variant overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-obscura-surface-variant">
        <PaperPlaneTilt size={16} weight="bold" className="text-obscura-primary" />
        <h2 className="text-sm font-semibold text-obscura-on-surface tracking-tight">Shielded Transfer</h2>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-xs text-obscura-on-surface-variant leading-relaxed">
          Transfer within the shielded pool. Breaks sender-receiver link via ZK proofs.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Nullifier Secret</label>
          <input
            type="text"
            value={nullifierSecret}
            onChange={(e) => setNullifierSecret(e.target.value)}
            placeholder="Comma-separated bytes"
            className="w-full rounded-lg bg-obscura-dark px-4 py-2.5 text-sm font-mono text-obscura-on-surface border border-obscura-surface-variant focus:outline-none focus:border-obscura-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-obscura-on-surface-variant">Recipient Commitment</label>
          <input
            type="text"
            value={recipientCommitment}
            onChange={(e) => setRecipientCommitment(e.target.value)}
            placeholder="Comma-separated bytes"
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
          onClick={handleTransfer}
          disabled={status === "loading" || !publicKey}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-obscura-primary px-4 py-3 text-sm font-semibold text-obscura-dark transition-all hover:brightness-110 active:scale-[0.98] active:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "loading" && <Spinner size={16} className="animate-spin" />}
          {status === "loading" ? "Transferring..." : "Shielded Transfer"}
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
