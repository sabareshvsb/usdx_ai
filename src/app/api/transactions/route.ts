import { NextResponse } from "next/server";
import { getTokenTransfers } from "@/lib/basechain";
import {
  TRACKED_CONTRACTS,
  TOKEN_SYMBOL,
  isTrackedContract,
  labelFor,
  type TrackedTransaction,
} from "@/lib/transactions";
import { TOKEN } from "@/lib/token";

interface TransferEvent {
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
  contract: string;
  contractLabel: string;
  direction: "in" | "out";
  counterparty: string;
}

export async function GET() {
  try {
    const transfers = await getTokenTransfers(
      TOKEN.contract,
      TRACKED_CONTRACTS.map((c) => c.address),
      1950
    );

    const events: TransferEvent[] = transfers.map((t) => {
      const trackedTo = isTrackedContract(t.to);
      const tracked = trackedTo ? t.to : t.from;

      return {
        ...t,
        contract: tracked,
        contractLabel: labelFor(tracked),
        direction: (trackedTo ? "in" : "out") as "in" | "out",
        counterparty: trackedTo ? t.from : t.to,
      };
    });

    // Group transfers by transaction hash
    const groups = new Map<string, TransferEvent[]>();
    for (const e of events) {
      const key = e.transactionHash;
      groups.set(key, [...(groups.get(key) ?? []), e]);
    }

    const txs: TrackedTransaction[] = [...groups.entries()]
      .map(([hash, list]) => {
        list.sort((a, b) => a.logIndex - b.logIndex);
        const primary = list[0];
        const sumValue = list.reduce((acc, e) => acc + e.value, BigInt(0));
        const relayed = list.length > 1;
        const isIn = primary.direction === "in";

        return {
          hash,
          block: primary.blockNumber,
          timestamp: primary.timestamp,
          from: primary.from,
          to: primary.to,
          value: sumValue.toString(),
          contract: primary.contract,
          contractLabel: primary.contractLabel,
          direction: isIn ? ("in" as const) : ("out" as const),
          counterparty: primary.counterparty,
          tokenSymbol: TOKEN_SYMBOL,
          relayed,
        };
      })
      .sort((a, b) => b.block - a.block);

    return NextResponse.json(
      { transactions: txs, trackedAt: Math.floor(Date.now() / 1000) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}