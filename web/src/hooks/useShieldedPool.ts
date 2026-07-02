"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { depositToPool, withdrawFromPool, shieldedTransfer, type WithdrawParams } from "@/lib/shielded/pool";
import { getIndexerHealth } from "@/lib/helius/zk-compression";

export function useShieldedPool() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexerHealthy, setIndexerHealthy] = useState(false);

  const checkIndexer = useCallback(async () => {
    try {
      const health = await getIndexerHealth();
      setIndexerHealthy(health.healthy);
    } catch {
      setIndexerHealthy(false);
    }
  }, []);

  const deposit = useCallback(
    async (params: {
      tokenMint: PublicKey;
      amount: bigint;
      depositorTokenAccount: PublicKey;
    }) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      setLoading(true);
      setError(null);
      try {
        const result = await depositToPool(connection, { publicKey, signTransaction }, params);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Deposit failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, connection]
  );

  const withdraw = useCallback(
    async (params: {
      nullifierSecret: Uint8Array;
      amount: bigint;
      recipient: PublicKey;
      recipientTokenAccount: PublicKey;
      merkleProof: WithdrawParams["merkleProof"];
    }) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      setLoading(true);
      setError(null);
      try {
        const signature = await withdrawFromPool(connection, { publicKey, signTransaction }, params);
        return signature;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Withdraw failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, connection]
  );

  const transfer = useCallback(
    async (params: {
      nullifierSecret: Uint8Array;
      amount: bigint;
      recipientCommitment: Uint8Array;
    }) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      setLoading(true);
      setError(null);
      try {
        const signature = await shieldedTransfer(connection, { publicKey, signTransaction }, params);
        return signature;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transfer failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, connection]
  );

  return { deposit, withdraw, transfer, loading, error, indexerHealthy, checkIndexer };
}
