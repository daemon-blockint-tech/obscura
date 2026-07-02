/// Client-side Merkle tree helpers for shielded pool.
/// Used to generate proofs for withdrawals.

export interface MerkleProof {
  siblings: Uint8Array[];
  pathIndices: boolean[]; // true = right, false = left
}

/// Compute leaf hash from a commitment.
/// TODO: Replace with Poseidon hash for ZK compatibility.
function hashLeaf(commitment: Uint8Array): Uint8Array {
  const { createHash } = require("crypto");
  return new Uint8Array(
    createHash("sha256")
      .update(Buffer.concat([Buffer.from("leaf"), Buffer.from(commitment)]))
      .digest()
  );
}

/// Compute parent hash from two children.
function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
  const { createHash } = require("crypto");
  return new Uint8Array(
    createHash("sha256")
      .update(Buffer.concat([Buffer.from(left), Buffer.from(right)]))
      .digest()
  );
}

/// Compute the merkle root from a list of leaves.
export function computeRoot(leaves: Uint8Array[]): Uint8Array {
  if (leaves.length === 0) return new Uint8Array(32);

  let layer = leaves.map(hashLeaf);

  while (layer.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : hashLeaf(new Uint8Array(32));
      next.push(hashPair(left, right));
    }
    layer = next;
  }

  return layer[0];
}

/// Generate a merkle proof for a leaf at a given index.
export function generateProof(
  leaves: Uint8Array[],
  leafIndex: number
): MerkleProof {
  const siblings: Uint8Array[] = [];
  const pathIndices: boolean[] = [];

  let layer = leaves.map(hashLeaf);
  let index = leafIndex;

  while (layer.length > 1) {
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;

    if (siblingIndex < layer.length) {
      siblings.push(layer[siblingIndex]);
    } else {
      siblings.push(hashLeaf(new Uint8Array(32)));
    }
    pathIndices.push(isRight);

    const next: Uint8Array[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : hashLeaf(new Uint8Array(32));
      next.push(hashPair(left, right));
    }
    layer = next;
    index = Math.floor(index / 2);
  }

  return { siblings, pathIndices };
}

/// Verify a merkle proof.
export function verifyProof(
  leaf: Uint8Array,
  proof: MerkleProof,
  root: Uint8Array
): boolean {
  let current = hashLeaf(leaf);

  for (let i = 0; i < proof.siblings.length; i++) {
    const sibling = proof.siblings[i];
    const isRight = proof.pathIndices[i];
    current = isRight ? hashPair(current, sibling) : hashPair(sibling, current);
  }

  return current.every((byte, i) => byte === root[i]);
}
