/// Display formatting utilities

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 4);
  return `${wholePart.toString()}.${fractionalStr}`;
}

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function formatSignature(signature: string): string {
  if (signature.length <= 20) return signature;
  return `${signature.slice(0, 12)}...${signature.slice(-8)}`;
}
