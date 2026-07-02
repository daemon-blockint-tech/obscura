/// Merkle tree helpers for the shielded pool.
/// Uses a binary tree with Poseidon hash (placeholder: keccak256 for devnet).

/// Compute a leaf hash from a commitment.
pub fn hash_leaf(commitment: &[u8; 32]) -> [u8; 32] {
    // TODO: Replace with Poseidon hash for ZK compatibility
    solana_program::keccak::hashv(&[b"leaf", commitment]).to_bytes()
}

/// Compute a parent hash from two children.
pub fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    // TODO: Replace with Poseidon hash
    solana_program::keccak::hashv(&[left, right]).to_bytes()
}

/// Compute the merkle root from a list of leaves.
/// Uses a simple binary tree construction.
pub fn compute_root(leaves: &[[u8; 32]]) -> [u8; 32] {
    if leaves.is_empty() {
        return [0u8; 32];
    }

    let mut layer: Vec<[u8; 32]> = leaves.iter().map(|l| hash_leaf(l)).collect();

    while layer.len() > 1 {
        let mut next_layer = Vec::with_capacity((layer.len() + 1) / 2);
        let mut i = 0;
        while i < layer.len() {
            let left = layer[i];
            let right = if i + 1 < layer.len() {
                layer[i + 1]
            } else {
                // Pad with zero hash if odd number of nodes
                hash_leaf(&[0u8; 32])
            };
            next_layer.push(hash_pair(&left, &right));
            i += 2;
        }
        layer = next_layer;
    }

    layer[0]
}

/// Verify a merkle proof for a given leaf.
/// proof is a list of (sibling_hash, is_right) pairs.
pub fn verify_proof(
    leaf: &[u8; 32],
    proof: &[( [u8; 32], bool )],
    root: &[u8; 32],
) -> bool {
    let mut current = hash_leaf(leaf);

    for (sibling, is_right) in proof {
        current = if *is_right {
            hash_pair(&current, sibling)
        } else {
            hash_pair(sibling, &current)
        };
    }

    current == *root
}
