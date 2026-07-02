import { PublicKey, Keypair } from "@solana/web3.js";

/// Derive ElGamal keypair from wallet signer + token account pubkey.
/// In production, this uses @solana-program/token-2022 helpers.
export function deriveElGamalKeypair(
  walletSecret: Uint8Array,
  tokenAccountPubkey: PublicKey
): { secret: Uint8Array; publicKey: Uint8Array } {
  // TODO: Use proper key derivation from @solana-program/token-2022
  // For now, derive from wallet secret + token account using a simple hash
  const combined = new Uint8Array([...walletSecret, ...tokenAccountPubkey.toBytes()]);
  const hash = new Uint8Array(32);
  for (let i = 0; i < combined.length; i++) {
    hash[i % 32] ^= combined[i];
  }
  return {
    secret: hash,
    publicKey: hash.slice(0, 32),
  };
}

/// Derive AES key from wallet signer + token account pubkey.
export function deriveAesKey(
  walletSecret: Uint8Array,
  tokenAccountPubkey: PublicKey
): Uint8Array {
  // TODO: Use proper key derivation
  const combined = new Uint8Array([...walletSecret, ...tokenAccountPubkey.toBytes()]);
  const key = new Uint8Array(32);
  for (let i = 0; i < combined.length; i++) {
    key[i % 32] ^= combined[i];
  }
  return key;
}

/// Generate a random nullifier secret.
export function generateNullifierSecret(): Uint8Array {
  return Keypair.generate().secretKey.slice(0, 32);
}

/// Generate random randomness for commitment.
export function generateRandomness(): Uint8Array {
  return Keypair.generate().secretKey.slice(0, 32);
}
