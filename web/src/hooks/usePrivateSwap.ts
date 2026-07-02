"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { executePrivateSwap, getJupiterQuote, type JupiterQuote } from "@/lib/swap/jupiter";

export function usePrivateSwap() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const fetchQuote = useCallback(
    async (params: {
      inputMint: PublicKey;
      outputMint: PublicKey;
      amount: bigint;
      slippageBps: number;
    }) => {
      setQuoting(true);
      setError(null);
      try {
        const q = await getJupiterQuote(params);
        setQuote(q);
        return q;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Quote failed");
        throw err;
      } finally {
        setQuoting(false);
      }
    },
    []
  );

  const executeSwap = useCallback(
    async (params: {
      inputMint: PublicKey;
      outputMint: PublicKey;
      amount: bigint;
      slippageBps: number;
    }) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      setLoading(true);
      setError(null);
      setSignature(null);

      try {
        const result = await executePrivateSwap(connection, { publicKey, signTransaction }, params);
        setSignature(result.signature);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Swap failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, connection]
  );

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
    setSignature(null);
    setLoading(false);
    setQuoting(false);
  }, []);

  return { quote, loading, quoting, error, signature, fetchQuote, executeSwap, reset };
}
