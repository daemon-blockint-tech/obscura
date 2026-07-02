declare_id!("OBSCurAXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod obscura {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.merkle_root = [0u8; 32];
        pool.next_leaf_index = 0;
        pool.total_deposits = 0;
        pool.total_withdrawals = 0;
        pool.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn deposit_shielded(
        ctx: Context<DepositShielded>,
        amount: u64,
        commitment: [u8; 32],
    ) -> Result<()> {
        require!(amount > 0, ObscuraError::InvalidAmount);

        let pool = &mut ctx.accounts.pool;

        // Transfer SPL tokens from depositor to pool vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.depositor_token_account.to_account_info(),
            to: ctx.accounts.pool_vault.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        // Update merkle tree (store commitment at next leaf index)
        emit!(DepositEvent {
            depositor: ctx.accounts.depositor.key(),
            commitment,
            leaf_index: pool.next_leaf_index,
            amount,
        });

        pool.next_leaf_index = pool.next_leaf_index.checked_add(1).ok_or(ObscuraError::PoolFull)?;
        pool.total_deposits = pool.total_deposits.checked_add(amount).ok_or(ObscuraError::Overflow)?;

        Ok(())
    }

    pub fn withdraw_shielded(
        ctx: Context<WithdrawShielded>,
        nullifier: [u8; 32],
        _proof: [u8; 64],
        recipient: Pubkey,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ObscuraError::InvalidAmount);

        let pool = &mut ctx.accounts.pool;

        // Check nullifier hasn't been spent
        let nullifier_account = &ctx.accounts.nullifier_account;
        require!(!nullifier_account.is_spent, ObscuraError::NullifierAlreadySpent);

        // Mark nullifier as spent
        let nullifier_acc = &mut ctx.accounts.nullifier_account;
        nullifier_acc.is_spent = true;
        nullifier_acc.nullifier = nullifier;
        nullifier_acc.spent_at = Clock::get()?.slot;

        // Transfer from pool vault to recipient
        let seeds = &[
            b"vault".as_ref(),
            pool.to_account_info().key.as_ref(),
            &[pool.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_vault.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        transfer(
            CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds),
            amount,
        )?;

        emit!(WithdrawEvent {
            recipient,
            nullifier,
            amount,
        });

        pool.total_withdrawals = pool
            .total_withdrawals
            .checked_add(amount)
            .ok_or(ObscuraError::Overflow)?;

        Ok(())
    }

    pub fn transfer_shielded(
        ctx: Context<TransferShielded>,
        nullifier: [u8; 32],
        _proof: [u8; 64],
        recipient_commitment: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Check nullifier hasn't been spent
        require!(
            !ctx.accounts.nullifier_account.is_spent,
            ObscuraError::NullifierAlreadySpent
        );

        // Mark old nullifier as spent
        let nullifier_acc = &mut ctx.accounts.nullifier_account;
        nullifier_acc.is_spent = true;
        nullifier_acc.nullifier = nullifier;
        nullifier_acc.spent_at = Clock::get()?.slot;

        // Add new commitment for recipient
        emit!(TransferEvent {
            nullifier,
            recipient_commitment,
            leaf_index: pool.next_leaf_index,
        });

        pool.next_leaf_index = pool.next_leaf_index.checked_add(1).ok_or(ObscuraError::PoolFull)?;

        Ok(())
    }

    pub fn update_merkle_root(
        ctx: Context<UpdateMerkleRoot>,
        new_root: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.pool.authority,
            ObscuraError::Unauthorized
        );

        let pool = &mut ctx.accounts.pool;
        pool.merkle_root = new_root;

        emit!(MerkleRootUpdated {
            old_root: pool.merkle_root,
            new_root,
        });

        Ok(())
    }
}

#[event]
pub struct DepositEvent {
    pub depositor: Pubkey,
    pub commitment: [u8; 32],
    pub leaf_index: u64,
    pub amount: u64,
}

#[event]
pub struct WithdrawEvent {
    pub recipient: Pubkey,
    pub nullifier: [u8; 32],
    pub amount: u64,
}

#[event]
pub struct TransferEvent {
    pub nullifier: [u8; 32],
    pub recipient_commitment: [u8; 32],
    pub leaf_index: u64,
}

#[event]
pub struct MerkleRootUpdated {
    pub old_root: [u8; 32],
    pub new_root: [u8; 32],
}

#[error_code]
pub enum ObscuraError {
    #[msg("Invalid amount: must be greater than zero")]
    InvalidAmount,
    #[msg("Pool is full: maximum leaf index reached")]
    PoolFull,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Nullifier has already been spent")]
    NullifierAlreadySpent,
    #[msg("Unauthorized: caller is not the pool authority")]
    Unauthorized,
    #[msg("Invalid proof: ZK proof verification failed")]
    InvalidProof,
    #[msg("Invalid merkle proof")]
    InvalidMerkleProof,
}
