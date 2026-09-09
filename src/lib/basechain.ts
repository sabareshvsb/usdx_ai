const RPC_URL = "https://mainnet.base.org";

export interface TxLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
}

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function padAddress(addr: string): string {
  const clean = addr.toLowerCase().replace(/^0x/, "");
  return "0x" + clean.padStart(64, "0");
}

function toHex(num: number): string {
  return "0x" + num.toString(16);
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: Math.floor(Math.random() * 1e9),
    }),
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error(`RPC ${method} failed`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

export async function getLatestBlock(): Promise<number> {
  const hex = await rpc<string>("eth_blockNumber", []);
  return parseInt(hex, 16);
}

export async function getBlockTimestamp(block: number): Promise<number> {
  const res = await rpc<{ timestamp?: string }>("eth_getBlockByNumber", [
    toHex(block),
    false,
  ]);
  if (!res) return 0;
  return parseInt(res.timestamp ?? "0", 16);
}

export interface TransferLog {
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
}

export async function getTokenTransfers(
  token: string,
  addresses: string[],
  windowBlocks = 1950
): Promise<TransferLog[]> {
  const latest = await getLatestBlock();
  const fromBlock = Math.max(0, latest - windowBlocks);
  const padded = addresses.map(padAddress);

  const logs: TxLog[] = [];

  // from = any of the addresses
  const fromRes = await rpc<TxLog[]>("eth_getLogs", [
    {
      address: token,
      fromBlock: toHex(fromBlock),
      toBlock: toHex(latest),
      topics: [TRANSFER_TOPIC, padded],
    },
  ]);

  // to = any of the addresses
  const toRes = await rpc<TxLog[]>("eth_getLogs", [
    {
      address: token,
      fromBlock: toHex(fromBlock),
      toBlock: toHex(latest),
      topics: [TRANSFER_TOPIC, null, padded],
    },
  ]);

  logs.push(...(fromRes ?? []), ...(toRes ?? []));

  // De-duplicate by txHash + logIndex
  const unique = new Map<string, TxLog>();
  for (const l of logs) {
    unique.set(`${l.transactionHash}:${l.logIndex}`, l);
  }

  const decoded: Omit<TransferLog, "timestamp">[] = [...unique.values()].map(
    (l) => ({
      from: "0x" + l.topics[1].slice(26),
      to: "0x" + l.topics[2].slice(26),
      value: BigInt(l.data),
      blockNumber: parseInt(l.blockNumber, 16),
      transactionHash: l.transactionHash,
      logIndex: parseInt(l.logIndex, 16),
    })
  );

  decoded.sort((a, b) => b.blockNumber - a.blockNumber);

  const recent = decoded.slice(0, 40);

  const blocks = [...new Set(recent.map((t) => t.blockNumber))];
  const timestamps = await Promise.all(
    blocks.map(async (b) => ({ [b]: await getBlockTimestamp(b) }))
  );
  const tsMap = Object.assign({}, ...timestamps);

  return recent.map((t) => ({ ...t, timestamp: tsMap[t.blockNumber] ?? 0 }));
}