import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { OBSCURA_PROGRAM_ID } from "../solana/rpc";
import { generateNullifierSecret, generateRandomness } from "../solana/keys";
import { createCommitment, deriveNullifier } from "./commitments";
import { submitTransactionWithFallback } from "../helius/sender";
import { getOptimalPriorityFee } from "../helius/priority-fee";
import { getCompressedAccountProof, getIndexerHealth } from "../helius/zk-compression";

/// Shielded pool client: deposit, withdraw, and transfer operations.

export interface DepositParams {
  amount: bigint;
  tokenMint: PublicKey;
  depositorTokenAccount: PublicKey;
}

export interface WithdrawParams {
  nullifierSecret: Uint8Array;
  amount: bigint;
  recipient: PublicKey;
  recipientTokenAccount: PublicKey;
  merkleProof: { sibling: Uint8Array; isRight: boolean }[];
}

export interface ShieldedTransferParams {
  nullifierSecret: Uint8Array;
  amount: bigint;
  recipientCommitment: Uint8Array;
}

/// Deposit tokens into the shielded pool.
/// 1. Generate nullifier secret + randomness
/// 2. Create commitment = hash(nullifier_secret, amount, randomness)
/// 3. Build deposit transaction
/// 4. Submit via Helius Sender with priority fee
export async function depositToPool(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  params: DepositParams
): Promise<{ signature: string; commitment: Uint8Array; nullifierSecret: Uint8Array }> {
  const nullifierSecret = generateNullifierSecret();
  const randomness = generateRandomness();
  const commitment = createCommitment(nullifierSecret, params.amount, randomness);

  // TODO: Build actual Anchor deposit instruction
  const tx = new Transaction();

  // Get priority fee estimate
  const serializedTx = tx.serialize({ requireAllSignatures: false }).toString("base64");
  const priorityFee = await getOptimalPriorityFee(serializedTx, "High");

  // TODO: Add ComputeBudgetProgram.setComputeUnitPrice instruction

  // Sign and submit via Helius Sender
  const signedTx = await wallet.signTransaction(tx);
  const signature = await submitTransactionWithFallback(signedTx, connection);

  return { signature, commitment, nullifierSecret };
}

/// Withdraw tokens from the shielded pool with ZK proof.
/// 1. Check indexer health
/// 2. Fetch Merkle proof via Helius ZK Compression API
/// 3. Build withdraw transaction with nullifier
/// 4. Submit via Helius Sender
export async function withdrawFromPool(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  params: WithdrawParams
): Promise<string> {
  // Check indexer health before reading compressed state
  const health = await getIndexerHealth();
  if (!health.healthy) {
    throw new Error("Indexer not healthy — cannot read compressed state");
  }

  const nullifier = deriveNullifier(params.nullifierSecret);

  // TODO: Fetch Merkle proof from Helius ZK Compression API
  // const proof = await getCompressedAccountProof(commitmentAddress);

  // TODO: Build actual Anchor withdraw instruction
  const tx = new Transaction();

  const signedTx = await wallet.signTransaction(tx);
  return submitTransactionWithFallback(signedTx, connection);
}

/// Internal shielded transfer (no token movement, just commitment update).
/// Breaks sender-receiver link.
export async function shieldedTransfer(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  params: ShieldedTransferParams
): Promise<string> {
  const nullifier = deriveNullifier(params.nullifierSecret);

  // TODO: Build actual Anchor transfer instruction
  const tx = new Transaction();

  const signedTx = await wallet.signTransaction(tx);
  return submitTransactionWithFallback(signedTx, connection);
}
