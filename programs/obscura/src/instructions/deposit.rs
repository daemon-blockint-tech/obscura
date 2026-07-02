use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use crate::state::*;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = ShieldedPool::LEN,
        seeds = [b"pool"],
        bump,
    )]
    pub pool: Account<'info, ShieldedPool>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositShielded<'info> {
    #[account(mut, seeds = [b"pool"], bump = pool.bump)]
    pub pool: Account<'info, ShieldedPool>,

    #[account(
        init_if_needed,
        payer = depositor,
        space = Nullifier::LEN,
        seeds = [b"nullifier", commitment.as_ref()],
        bump,
    )]
    pub nullifier_account: Account<'info, Nullifier>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump)]
    pub pool_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawShielded<'info> {
    #[account(mut, seeds = [b"pool"], bump = pool.bump)]
    pub pool: Account<'info, ShieldedPool>,

    #[account(
        init_if_needed,
        payer = withdrawer,
        space = Nullifier::LEN,
        seeds = [b"nullifier", nullifier.as_ref()],
        bump,
    )]
    pub nullifier_account: Account<'info, Nullifier>,

    #[account(mut)]
    pub withdrawer: Signer<'info>,

    /// CHECK: Recipient address validated by token transfer
    pub recipient: Account<'info, UncheckedAccount>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump)]
    pub pool_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferShielded<'info> {
    #[account(mut, seeds = [b"pool"], bump = pool.bump)]
    pub pool: Account<'info, ShieldedPool>,

    #[account(
        init_if_needed,
        payer = sender,
        space = Nullifier::LEN,
        seeds = [b"nullifier", nullifier.as_ref()],
        bump,
    )]
    pub nullifier_account: Account<'info, Nullifier>,

    #[account(mut)]
    pub sender: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMerkleRoot<'info> {
    #[account(mut, seeds = [b"pool"], bump = pool.bump)]
    pub pool: Account<'info, ShieldedPool>,

    #[account(mut)]
    pub authority: Signer<'info>,
}
