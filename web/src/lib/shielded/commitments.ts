/// Commitment generation for the shielded pool.
/// commitment = Poseidon(nullifier_secret, amount, randomness)
/// nullifier = Poseidon(nullifier_secret)

/// Create a commitment for a shielded pool deposit.
/// In production, uses Poseidon hash for ZK compatibility.
/// For devnet, uses keccak256 as placeholder.
export function createCommitment(
  nullifierSecret: Uint8Array,
  amount: bigint,
  randomness: Uint8Array
): Uint8Array {
  // TODO: Replace with Poseidon hash via @lightprotocol/crypto or circomlibjs
  const { createHash } = require("crypto");
  const data = Buffer.concat([
    Buffer.from(nullifierSecret),
    Buffer.from(amount.toString(16).padStart(64, "0"), "hex"),
    Buffer.from(randomness),
  ]);
  return new Uint8Array(createHash("sha256").update(data).digest());
}

/// Derive a nullifier from a nullifier secret.
/// nullifier = Poseidon(nullifier_secret)
export function deriveNullifier(nullifierSecret: Uint8Array): Uint8Array {
  // TODO: Replace with Poseidon hash
  const { createHash } = require("crypto");
  return new Uint8Array(createHash("sha256").update(Buffer.from(nullifierSecret)).digest());
}

/// Generate a commitment and nullifier pair for a deposit.
export function generateCommitmentPair(
  nullifierSecret: Uint8Array,
  amount: bigint,
  randomness: Uint8Array
): { commitment: Uint8Array; nullifier: Uint8Array } {
  return {
    commitment: createCommitment(nullifierSecret, amount, randomness),
    nullifier: deriveNullifier(nullifierSecret),
  };
}
