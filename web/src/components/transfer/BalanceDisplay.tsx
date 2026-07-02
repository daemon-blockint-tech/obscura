"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/utils/format";

export function BalanceDisplay() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="rounded-xl bg-obscura-surface p-6 border border-obscura-surface-variant">
      <h2 className="text-xl font-semibold text-obscura-on-surface mb-4">Wallet</h2>
      {connected && publicKey ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-obscura-on-surface-variant">Address</span>
            <span className="font-mono text-obscura-secondary">
              {shortenAddress(publicKey.toBase58())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-obscura-on-surface-variant">Confidential Balance</span>
            <span className="text-obscura-on-surface">Encrypted</span>
          </div>
          <div className="flex justify-between">
            <span className="text-obscura-on-surface-variant">Shielded Balance</span>
            <span className="text-obscura-on-surface">0.00</span>
          </div>
        </div>
      ) : (
        <p className="text-obscura-on-surface-variant">Connect wallet to view balances</p>
      )}
    </div>
  );
}
