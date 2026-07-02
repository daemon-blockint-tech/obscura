"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress } from "@/lib/utils/format";
import Image from "next/image";
import { Plugs } from "@phosphor-icons/react";

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <WalletMultiButton className="!bg-obscura-primary !rounded-lg !font-semibold !text-sm hover:!brightness-110 transition-all active:scale-[0.98]" />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg bg-obscura-surface border border-obscura-surface-variant px-3 py-2 text-xs">
        <Plugs size={14} weight="fill" className="text-obscura-primary" />
        <span className="text-obscura-on-surface-variant">Connected</span>
        <span className="text-obscura-on-surface font-mono">
          {publicKey ? shortenAddress(publicKey.toBase58()) : ""}
        </span>
      </div>
      <WalletMultiButton className="!bg-obscura-error !rounded-lg !font-semibold !text-sm hover:!brightness-110 transition-all active:scale-[0.98]" />
    </div>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh]">
      <nav className="sticky top-0 z-40 border-b border-obscura-surface-variant/50 bg-obscura-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5">
          <a href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo/white_obscura_logo.png"
              alt="Obscura"
              width={28}
              height={28}
              className="transition-opacity group-hover:opacity-80"
            />
            <span className="text-base font-semibold tracking-tight text-obscura-on-surface">
              Obscura
            </span>
          </a>
          <WalletButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
