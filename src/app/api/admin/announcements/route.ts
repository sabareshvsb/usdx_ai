import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";

export async function GET() {
  return orUnauthorized(async () => {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_announcements")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ announcements: data });
  });
}

export async function POST(request: Request) {
  return orUnauthorized(async () => {
    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("cms_announcements")
      .insert({
        title,
        message: body.message ?? "",
        link_text: body.link_text ?? "",
        link_url: body.link_url ?? "",
        status: body.status === "published" ? "published" : "draft",
        sort_order: Number(body.sort_order ?? 0),
        published_at: body.status === "published" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ announcement: data });
  });
}