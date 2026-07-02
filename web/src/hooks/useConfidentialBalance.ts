"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssetsByOwner } from "@/lib/helius/das";
import { decryptAvailableBalance } from "@/lib/solana/confidential";

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  symbol: string;
  confidential: boolean;
}

export function useConfidentialBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalances([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assets = await getAssetsByOwner(publicKey.toBase58());

      const tokenBalances: TokenBalance[] = assets.map((asset) => ({
        mint: asset.id,
        amount: String(asset.token_info?.balance ?? 0),
        decimals: asset.token_info?.decimals ?? 9,
        symbol: asset.content?.metadata?.symbol ?? "UNKNOWN",
        confidential: false,
      }));

      setBalances(tokenBalances);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balances, loading, error, refresh };
}
