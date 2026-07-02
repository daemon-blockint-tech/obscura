import { Connection, clusterApiUrl, Commitment } from "@solana/web3.js";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

function getRpcUrl(): string {
  if (HELIUS_API_KEY) {
    return `https://${NETWORK}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }
  return clusterApiUrl(NETWORK as "devnet" | "mainnet-beta" | "testnet");
}

export const RPC_URL = getRpcUrl();
export const SENDER_URL = "https://sender.helius-rpc.com/fast";
export const OBSCURA_PROGRAM_ID = process.env.NEXT_PUBLIC_OBSCURA_PROGRAM_ID || "";

export function getConnection(commitment: Commitment = "confirmed"): Connection {
  return new Connection(RPC_URL, commitment);
}
