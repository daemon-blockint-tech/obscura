/// Helius Webhooks: Real-time event monitoring for shielded pool.
/// Monitor obscura program for deposit/withdraw events.
/// Notify backend indexer of new commitments/nullifiers.

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";

interface WebhookConfig {
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: "enhanced" | "raw";
  authHeaders?: Record<string, string>;
}

/// Create a webhook to monitor the obscura program.
export async function createWebhook(
  config: WebhookConfig
): Promise<{ webhookID: string; webhookURL: string }> {
  const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Webhook creation failed: ${response.status}`);
  }

  return response.json();
}

/// List all webhooks.
export async function listWebhooks() {
  const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${HELIUS_API_KEY}`);
  if (!response.ok) throw new Error(`List webhooks failed: ${response.status}`);
  return response.json();
}

/// Delete a webhook by ID.
export async function deleteWebhook(webhookID: string): Promise<void> {
  const response = await fetch(
    `https://api.helius.xyz/v0/webhooks/${webhookID}?api-key=${HELIUS_API_KEY}`,
    { method: "DELETE" }
  );
  if (!response.ok) throw new Error(`Delete webhook failed: ${response.status}`);
}

/// Create a webhook to monitor shielded pool deposits and withdrawals.
export async function monitorShieldedPool(
  programId: string,
  callbackUrl: string
): Promise<{ webhookID: string; webhookURL: string }> {
  return createWebhook({
    webhookURL: callbackUrl,
    transactionTypes: ["any"],
    accountAddresses: [programId],
    webhookType: "enhanced",
  });
}
