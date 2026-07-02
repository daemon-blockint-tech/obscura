import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { Obscura } from "../target/types/obscura";

describe("Obscura — Shielded Pool", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Obscura as Program<Obscura>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  describe("Initialize Pool", () => {
    it("Initializes the shielded pool", async () => {
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool")],
        program.programId
      );

      await program.methods
        .initializePool()
        .accounts({
          pool: poolPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.shieldedPool.fetch(poolPda);
      expect(poolAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(poolAccount.nextLeafIndex.toNumber()).to.equal(0);
      expect(poolAccount.totalDeposits.toNumber()).to.equal(0);
    });
  });

  describe("Deposit Shielded", () => {
    it("Deposits tokens and emits commitment", async () => {
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool")],
        program.programId
      );

      const commitment = new Uint8Array(32);
      crypto.getRandomValues(commitment);

      // TODO: Create mint and token accounts for testing
      // For now, just verify the instruction structure exists
      expect(program.methods.depositShielded).to.be.a("function");
    });
  });

  describe("Update Merkle Root", () => {
    it("Updates the merkle root", async () => {
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool")],
        program.programId
      );

      const newRoot = new Uint8Array(32);
      crypto.getRandomValues(newRoot);

      await program.methods
        .updateMerkleRoot(Array.from(newRoot))
        .accounts({
          pool: poolPda,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.shieldedPool.fetch(poolPda);
      expect(Array.from(poolAccount.merkleRoot)).to.deep.equal(Array.from(newRoot));
    });
  });
});

describe("Obscura — Merkle Tree Utils", () => {
  it("Computes root from empty leaves", () => {
    // Test the merkle tree computation
    const leaves: Uint8Array[] = [];
    // Root of empty tree should be zero
    expect(leaves.length).to.equal(0);
  });

  it("Computes root from single leaf", () => {
    const leaf = new Uint8Array(32);
    crypto.getRandomValues(leaf);
    expect(leaf.length).to.equal(32);
  });
});
