import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import type { ContentBlock } from "@/lib/cms-types";

export async function GET() {
  return orUnauthorized(async () => {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sections: data });
  });
}

export async function POST(request: Request) {
  return orUnauthorized(async () => {
    const body = await request.json().catch(() => null);
    const b = body ?? {};
    const key = typeof b.key === "string" ? b.key.trim() : "";
    const title = typeof b.title === "string" ? b.title.trim() : "";
    if (!key || !title) {
      return NextResponse.json(
        { error: "Key and title are required." },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_sections")
      .insert({
        key,
        title,
        heading: b.heading ?? "",
        subheading: b.subheading ?? "",
        body: Array.isArray(b.body) ? (b.body as ContentBlock[]) : [],
        image_url: b.image_url ?? "",
        button_text: b.button_text ?? "",
        button_link: b.button_link ?? "",
        enabled: b.enabled !== false,
        status: b.status === "published" ? "published" : "draft",
        sort_order: Number(b.sort_order ?? 0),
        published_at: b.status === "published" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A section with this key already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ section: data });
  });
}