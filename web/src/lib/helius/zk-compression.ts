import { RPC_URL } from "../solana/rpc";

/// Helius ZK Compression API: Light Protocol state queries via JSON-RPC.
/// Used for shielded pool commitment verification and validity proofs.

interface RpcResponse<T> {
  result: T;
  error?: { code: number; message: string };
}

interface CompressedAccountProof {
  root: number[];
  proof: number[][];
  leafIndex: number;
  leaf: number[];
}

interface ValidityProof {
  proof: number[];
  root: number[];
}

interface IndexerHealth {
  healthy: boolean;
  slot: number;
}

async function zkRpc<T>(method: string, params: unknown[]): Promise<T> {
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
    throw new Error(`ZK RPC error: ${response.status}`);
  }

  const data: RpcResponse<T> = await response.json();
  if (data.error) {
    throw new Error(`ZK RPC error: ${data.error.message}`);
  }
  return data.result;
}

/// Fetch Merkle proof for a compressed account (shielded pool commitment).
/// 10 credits per call.
export async function getCompressedAccountProof(
  address: string
): Promise<CompressedAccountProof> {
  return zkRpc("getCompressedAccountProof", [address]);
}

/// Get ZK validity proof for compressed state transitions.
/// 100 credits per call.
export async function getValidityProof(
  hashes: string[]
): Promise<ValidityProof> {
  return zkRpc("getValidityProof", [{ hashes }]);
}

/// List user's compressed accounts.
/// 10 credits per call.
export async function getCompressedAccountsByOwner(
  ownerAddress: string
): Promise<unknown[]> {
  return zkRpc("getCompressedAccountsByOwner", [{ ownerAddress }]);
}

/// Display compressed token balances in UI.
/// 10 credits per call.
export async function getCompressedTokenBalancesByOwner(
  ownerAddress: string
): Promise<unknown[]> {
  return zkRpc("getCompressedTokenBalancesByOwner", [{ ownerAddress }]);
}

/// Check indexer sync before reading compressed state.
/// Always call this before other ZK queries to ensure data is current.
export async function getIndexerHealth(): Promise<IndexerHealth> {
  return zkRpc("getIndexerHealth", []);
}
