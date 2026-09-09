import type { Candle } from "@/components/dashboard/CandlestickChart";

const POOL_ADDRESS = "0x6f15abBe3e968FeF47A26Ad8A244F843c717Ff84";
const CHAIN = "base";

export async function fetchCandles(timeframe = "minute", aggregate = 15, limit = 100): Promise<Candle[]> {
  const base = `https://api.geckoterminal.com/api/v2/networks`;
  const url = `${base}/${CHAIN}/pools/${POOL_ADDRESS}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}&currency=token&token=base`;

  const res = await fetch(url);

  if (!res.ok) throw new Error("GeckoTerminal fetch failed");

  const json = await res.json();
  const rows: number[][] = json?.data?.attributes?.ohlcv_list ?? [];

  return rows
    .map((row) => {
      const [time, open, high, low, close, volume] = row;
      return {
        time: Math.floor(time),
        open,
        high,
        low,
        close,
        volume,
      };
    })
    .reverse();
}