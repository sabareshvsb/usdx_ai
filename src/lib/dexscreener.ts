const PAIR_ADDRESS = "0x6f15abBe3e968FeF47A26Ad8A244F843c717Ff84";
const CHAIN = "base";

export interface DexScreenerData {
  price: number;
  priceUsd: string;
  priceChange24h: number;
  priceChange1h: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  buys24h: number;
  sells24h: number;
  txns24h: number;
  liquidityUsd: number;
  liquidityBase: number;
  liquidityQuote: number;
  high24h: number;
  low24h: number;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  dexUrl: string;
}

export async function fetchDexScreenerData(): Promise<DexScreenerData> {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/${CHAIN}/${PAIR_ADDRESS}`,
    { next: { revalidate: 30 } }
  );

  if (!res.ok) throw new Error("DexScreener fetch failed");

  const json = await res.json();
  const pair = json.pairs?.[0];

  if (!pair) throw new Error("No pair data found");

  const buys24h = pair.txns?.h24?.buys ?? 0;
  const sells24h = pair.txns?.h24?.sells ?? 0;

  return {
    price: parseFloat(pair.priceNative || "0"),
    priceUsd: pair.priceUsd || "0",
    priceChange24h: pair.priceChange?.h24 ?? 0,
    priceChange1h: pair.priceChange?.h1 ?? 0,
    volume24h: pair.volume?.h24 ?? 0,
    volume6h: pair.volume?.h6 ?? 0,
    volume1h: pair.volume?.h1 ?? 0,
    buys24h,
    sells24h,
    txns24h: buys24h + sells24h,
    liquidityUsd: pair.liquidity?.usd ?? 0,
    liquidityBase: pair.liquidity?.base ?? 0,
    liquidityQuote: pair.liquidity?.quote ?? 0,
    high24h: parseFloat(pair.priceNative || "0") * (1 + Math.abs(pair.priceChange?.h24 ?? 0) / 100),
    low24h: parseFloat(pair.priceNative || "0") * (1 - Math.abs(pair.priceChange?.h24 ?? 0) / 100),
    fdv: pair.fdv ?? 0,
    marketCap: pair.marketCap ?? 0,
    pairCreatedAt: pair.pairCreatedAt ?? 0,
    dexUrl: pair.url || "",
  };
}
