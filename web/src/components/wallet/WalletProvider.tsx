"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress } from "@/lib/utils/format";

export function WalletButton() {
  const { connected, publicKey, connecting } = useWallet();

  if (!connected) {
    return (
      <WalletMultiButton className="!bg-obscura-primary !rounded-lg !font-semibold hover:!opacity-90" />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-obscura-surface-variant px-4 py-2 text-sm">
        <span className="text-obscura-on-surface-variant">Connected: </span>
        <span className="text-obscura-secondary font-mono">
          {publicKey ? shortenAddress(publicKey.toBase58()) : ""}
        </span>
      </div>
      <WalletMultiButton className="!bg-obscura-error !rounded-lg !font-semibold hover:!opacity-90" />
    </div>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-obscura-surface-variant px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-xl font-bold text-obscura-primary">
            Obscura
          </a>
          <WalletButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
