import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import type { CmsSettings } from "@/lib/cms-types";

export async function GET() {
  return orUnauthorized(async () => {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_settings")
      .select("key, value, updated_at")
      .order("key", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const settings = (data ?? []).map((row) => ({
      key: String(row.key),
      value: row.value == null ? "" : String(row.value),
      updated_at: String(row.updated_at ?? ""),
    }));
    return NextResponse.json({ settings });
  });
}

export async function POST(request: Request) {
  return orUnauthorized(async () => {
    const body = await request.json().catch(() => null);
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    const value = typeof body?.value === "string" ? body.value : "";

    if (!key) {
      return NextResponse.json({ error: "Key is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ setting: data });
  });
}

export async function PUT(request: Request) {
  return orUnauthorized(async () => {
    const body = await request.json().catch(() => null);
    const settings = body?.settings;
    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Provide a settings object." },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const entries = Object.entries(settings).filter(([, v]) => typeof v === "string");

    for (const [key, value] of entries) {
      const { error } = await admin.from("cms_settings").upsert({
        key,
        value: value as string,
        updated_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = await admin.from("cms_settings").select("*");
    const result: CmsSettings = {};
    for (const row of data ?? []) {
      result[row.key as keyof CmsSettings] = row.value as string;
    }
    return NextResponse.json({ settings: result });
  });
}