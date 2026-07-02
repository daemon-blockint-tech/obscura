import { RPC_URL } from "../solana/rpc";

/// Helius DAS API: Token metadata and asset queries for swap UI.
/// Use getAssetsByOwner instead of getTokenAccountsByOwner for richer metadata.

interface DasAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
    };
    links?: {
      image?: string;
    };
  };
  token_info?: {
    balance?: number;
    decimals?: number;
    symbol?: string;
  };
}

interface DasResponse {
  items: DasAsset[];
  total: number;
  page: number;
}

async function dasRpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`DAS API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

/// Get all assets owned by a wallet address.
/// Used for token selection in swap UI.
export async function getAssetsByOwner(
  ownerAddress: string,
  page: number = 1,
  limit: number = 100
): Promise<DasAsset[]> {
  const result = await dasRpc<DasResponse>("getAssetsByOwner", [
    { ownerAddress, page, limit },
  ]);
  return result.items;
}

/// Search assets by token symbol or name.
export async function searchAssets(
  query: string,
  tokenType: "fungible" | "nonFungible" = "fungible"
): Promise<DasAsset[]> {
  const result = await dasRpc<DasResponse>("searchAssets", [
    { tokenType, searchQuery: query, page: 1, limit: 50 },
  ]);
  return result.items;
}

/// Get asset metadata for a specific token mint.
export async function getAsset(mintAddress: string): Promise<DasAsset | null> {
  const result = await dasRpc<DasAsset>("getAsset", [mintAddress]);
  return result;
}
