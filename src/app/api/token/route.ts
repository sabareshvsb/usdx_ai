import { NextResponse } from "next/server";
import { fetchDexScreenerData } from "@/lib/dexscreener";

export async function GET() {
  try {
    const data = await fetchDexScreenerData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("DexScreener API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
