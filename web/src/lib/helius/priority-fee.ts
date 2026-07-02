import { RPC_URL } from "../solana/rpc";

/// Helius Priority Fee API: Dynamic fee estimation via getPriorityFeeEstimate.
/// Pass full serialized tx for program-specific estimates.

interface PriorityFeeEstimateResult {
  result: {
    priorityFeeEstimate: number;
  };
}

/// Get priority fee estimate for a serialized transaction.
/// priorityLevel: "Min" | "Low" | "Medium" | "High" | "VeryHigh" | "UnsafeMax"
export async function getPriorityFeeEstimate(
  serializedTx: string,
  priorityLevel: "Min" | "Low" | "Medium" | "High" | "VeryHigh" | "UnsafeMax" = "High"
): Promise<number> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          transaction: serializedTx,
          options: {
            priorityLevel,
            includeLamportsCPULimits: true,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Priority fee estimate failed: ${response.status}`);
  }

  const data: PriorityFeeEstimateResult = await response.json();
  return data.result.priorityFeeEstimate;
}

/// Get priority fee and return a ComputeBudgetProgram.setComputeUnitPrice instruction value.
export async function getOptimalPriorityFee(
  serializedTx: string,
  priorityLevel: "Min" | "Low" | "Medium" | "High" | "VeryHigh" | "UnsafeMax" = "High"
): Promise<number> {
  const estimate = await getPriorityFeeEstimate(serializedTx, priorityLevel);
  // Convert to microLamports (estimate is in lamports per CU)
  return Math.ceil(estimate);
}
