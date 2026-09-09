export const TRACKED_CONTRACTS = [
  {
    address: "0x079C3035E68aE1aE6A45303B16d67Fa727c2cC35",
    label: "Staking V1",
  },
  {
    address: "0x8115881deD1EDf38f2bf526A019c9cC76D3d0140",
    label: "Staking V2",
  },
] as const;

export const TOKEN_DECIMALS = 18;
export const TOKEN_SYMBOL = "USDXSMART";

export type TxDirection = "in" | "out";

export interface TrackedTransaction {
  hash: string;
  block: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  contract: string;
  contractLabel: string;
  direction: TxDirection;
  counterparty: string;
  tokenSymbol: string;
  relayed?: boolean;
}

function normalize(addr: string): string {
  return addr.toLowerCase();
}

export function isTrackedContract(addr: string): boolean {
  const norm = normalize(addr);
  return TRACKED_CONTRACTS.some((c) => normalize(c.address) === norm);
}

export function labelFor(addr: string): string {
  const norm = normalize(addr);
  const found = TRACKED_CONTRACTS.find(
    (c) => normalize(c.address) === norm
  );
  return found?.label ?? "Contract";
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatTokenAmount(wei: string, decimals = TOKEN_DECIMALS): string {
  const parts = (wei || "0").split(".");
  try {
    const value = BigInt(parts[0]);
    const whole = value / BigInt(10) ** BigInt(decimals);
    const frac = value % BigInt(10) ** BigInt(decimals);
    const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4);
    return `${whole.toLocaleString("en-US")}.${fracStr}`;
  } catch {
    return "0";
  }
}

export function timeAgo(timestamp: number): string {
  if (!timestamp) return "—";
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}