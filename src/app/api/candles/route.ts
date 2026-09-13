import { NextResponse } from "next/server";
import { fetchCandles } from "@/lib/geckoterminal";

export async function GET() {
  try {
    const candles = await fetchCandles("hour", 1, 100);
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 24 * 60 * 60;

    let high24h = -Infinity;
    let low24h = Infinity;
    let volume24h = 0;

    for (const c of candles) {
      if (c.time >= dayAgo) {
        if (c.high > high24h) high24h = c.high;
        if (c.low < low24h) low24h = c.low;
        volume24h += c.volume;
      }
    }

    if (high24h === -Infinity) high24h = candles[candles.length - 1]?.high ?? 0;
    if (low24h === Infinity) low24h = candles[candles.length - 1]?.low ?? 0;

    return NextResponse.json({ candles, high24h, low24h, volume24h }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("GeckoTerminal API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}