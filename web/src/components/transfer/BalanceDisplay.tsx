"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/utils/format";
import { Wallet } from "@phosphor-icons/react";

export function BalanceDisplay() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="rounded-xl bg-obscura-surface border border-obscura-surface-variant overflow-hidden">
      <div className="px-5 py-4 border-b border-obscura-surface-variant">
        <div className="flex items-center gap-2">
          <Wallet size={16} weight="regular" className="text-obscura-on-surface-variant" />
          <h2 className="text-sm font-semibold text-obscura-on-surface tracking-tight">Wallet</h2>
        </div>
      </div>

      {connected && publicKey ? (
        <div className="divide-y divide-obscura-surface-variant/50">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs text-obscura-on-surface-variant">Address</span>
            <span className="font-mono text-xs text-obscura-on-surface">
              {shortenAddress(publicKey.toBase58())}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs text-obscura-on-surface-variant">Confidential</span>
            <span className="text-xs font-mono text-obscura-on-surface-variant">Encrypted</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-xs text-obscura-on-surface-variant">Shielded</span>
            <span className="text-xs font-mono text-obscura-on-surface">0.00</span>
          </div>
        </div>
      ) : (
        <div className="px-5 py-8 flex flex-col items-center gap-2">
          <Wallet size={24} weight="thin" className="text-obscura-surface-variant" />
          <p className="text-xs text-obscura-on-surface-variant text-center">
            Connect wallet to view balances
          </p>
        </div>
      )}
    </div>
  );
}
