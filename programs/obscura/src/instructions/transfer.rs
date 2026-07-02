// Transfer instruction logic is implemented in lib.rs
// This file contains transfer-specific helpers

use anchor_lang::prelude::*;

/// Generate a new commitment for the recipient of a shielded transfer.
/// commitment = Poseidon(nullifier_secret, amount, randomness)
pub fn generate_commitment(
    nullifier_secret: &[u8; 32],
    amount: u64,
    randomness: &[u8; 32],
) -> [u8; 32] {
    // TODO: Use Poseidon hash via Light Protocol or custom implementation
    // For now, use a simple concatenation hash (devnet only)
    let mut data = Vec::with_capacity(72);
    data.extend_from_slice(nullifier_secret);
    data.extend_from_slice(&amount.to_le_bytes());
    data.extend_from_slice(randomness);

    // Use Solana's keccak256 as placeholder
    solana_program::keccak::hashv(&[&data]).to_bytes()
}

/// Derive a nullifier from a nullifier secret.
/// nullifier = Poseidon(nullifier_secret)
pub fn derive_nullifier(nullifier_secret: &[u8; 32]) -> [u8; 32] {
    // TODO: Use Poseidon hash
    solana_program::keccak::hashv(&[nullifier_secret]).to_bytes()
}
