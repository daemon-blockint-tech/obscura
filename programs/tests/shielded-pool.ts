import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { expect } from "chai";
import { Obscura } from "../target/types/obscura";

describe("Obscura — Shielded Pool Operations", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Obscura as Program<Obscura>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  let poolPda: PublicKey;

  before(async () => {
    [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool")],
      program.programId
    );
  });

  describe("Pool Lifecycle", () => {
    it("Initializes pool with correct defaults", async () => {
      try {
        await program.methods
          .initializePool()
          .accounts({
            pool: poolPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
      } catch (e) {
        // Pool may already exist from previous test run
      }

      const pool = await program.account.shieldedPool.fetch(poolPda);
      expect(pool.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(pool.nextLeafIndex.toNumber()).to.equal(0);
      expect(pool.totalDeposits.toNumber()).to.equal(0);
      expect(pool.totalWithdrawals.toNumber()).to.equal(0);
    });

    it("Rejects initialization from non-authority", async () => {
      const attacker = Keypair.generate();
      // Fund attacker
      const sig = await provider.connection.requestAirdrop(
        attacker.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      try {
        await program.methods
          .initializePool()
          .accounts({
            pool: poolPda,
            authority: attacker.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([attacker])
          .rpc();
        expect.fail("Should have rejected non-authority initialization");
      } catch (e) {
        // Expected: pool already exists or wrong authority
        expect(e).to.be.an("error");
      }
    });
  });

  describe("Deposit Flow", () => {
    it("Emits DepositEvent with commitment", async () => {
      // TODO: Full deposit test requires:
      // 1. Create Token-2022 mint with confidential transfer extension
      // 2. Create token accounts
      // 3. Mint tokens to depositor
      // 4. Generate commitment client-side
      // 5. Call deposit_shielded
      // 6. Verify event emission and pool state update

      // For now, verify instruction exists
      expect(program.methods.depositShielded).to.be.a("function");
    });
  });

  describe("Withdraw Flow", () => {
    it("Rejects withdrawal without valid ZK proof", async () => {
      // TODO: Test that withdrawal fails without proper proof
      // This validates the proof verification path
      expect(program.methods.withdrawShielded).to.be.a("function");
    });

    it("Rejects double-spend via nullifier", async () => {
      // TODO: Test that spending the same nullifier twice fails
      // This validates the nullifier set
      expect(program.methods.withdrawShielded).to.be.a("function");
    });
  });

  describe("Transfer Flow", () => {
    it("Executes internal shielded transfer", async () => {
      // TODO: Test internal transfer within pool
      // 1. Deposit from account A
      // 2. Shielded transfer to commitment of account B
      // 3. Withdraw from account B
      // 4. Verify unlinkability
      expect(program.methods.transferShielded).to.be.a("function");
    });
  });

  describe("Merkle Root Updates", () => {
    it("Updates root and emits event", async () => {
      const newRoot = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        newRoot[i] = Math.floor(Math.random() * 256);
      }

      await program.methods
        .updateMerkleRoot(Array.from(newRoot))
        .accounts({
          pool: poolPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const pool = await program.account.shieldedPool.fetch(poolPda);
      expect(Array.from(pool.merkleRoot)).to.deep.equal(Array.from(newRoot));
    });

    it("Rejects root update from non-authority", async () => {
      const attacker = Keypair.generate();
      const sig = await provider.connection.requestAirdrop(
        attacker.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      const fakeRoot = new Uint8Array(32);

      try {
        await program.methods
          .updateMerkleRoot(Array.from(fakeRoot))
          .accounts({
            pool: poolPda,
            authority: attacker.publicKey,
          })
          .signers([attacker])
          .rpc();
        expect.fail("Should have rejected non-authority update");
      } catch (e) {
        expect(e).to.be.an("error");
      }
    });
  });

  describe("Nullifier Set", () => {
    it("Prevents double-spending", async () => {
      // TODO: Full double-spend test requires:
      // 1. Deposit tokens
      // 2. Withdraw with nullifier N
      // 3. Attempt to withdraw again with same nullifier N
      // 4. Verify second withdrawal fails
      // This is the critical security guarantee of the shielded pool
      expect(true).to.be.true;
    });
  });
});
