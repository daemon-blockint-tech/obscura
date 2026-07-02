use anchor_lang::prelude::*;

#[account]
pub struct ShieldedPool {
    /// Authority who can update the merkle root
    pub authority: Pubkey,
    /// Current merkle tree root hash
    pub merkle_root: [u8; 32],
    /// Next leaf index for new commitments
    pub next_leaf_index: u64,
    /// Total deposits (for accounting)
    pub total_deposits: u64,
    /// Total withdrawals (for accounting)
    pub total_withdrawals: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl ShieldedPool {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // merkle_root
        8 +  // next_leaf_index
        8 +  // total_deposits
        8 +  // total_withdrawals
        1;   // bump
}
