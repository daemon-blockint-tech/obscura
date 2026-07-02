use anchor_lang::prelude::*;

/// A commitment represents a deposit in the shielded pool.
/// commitment = Poseidon(nullifier_secret, amount, randomness)
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub struct Commitment {
    /// Poseidon hash of (nullifier_secret, amount, randomness)
    pub hash: [u8; 32],
    /// Index in the merkle tree
    pub leaf_index: u64,
    /// Amount committed (encrypted in production)
    pub amount: u64,
}

impl Commitment {
    pub const LEN: usize = 32 + 8 + 8;
}
