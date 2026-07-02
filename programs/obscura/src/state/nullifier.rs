use anchor_lang::prelude::*;

/// Nullifier account to prevent double-spends in the shielded pool.
/// Each nullifier is derived from the commitment's nullifier_secret.
#[account]
pub struct Nullifier {
    /// The nullifier hash (Poseidon(nullifier_secret))
    pub nullifier: [u8; 32],
    /// Whether this nullifier has been spent
    pub is_spent: bool,
    /// Slot when the nullifier was spent
    pub spent_at: u64,
}

impl Nullifier {
    pub const LEN: usize = 8 + // discriminator
        32 + // nullifier
        1 +  // is_spent
        8;   // spent_at
}
