import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";

export async function GET() {
  return orUnauthorized(async (admin) => NextResponse.json({ admin }));
}