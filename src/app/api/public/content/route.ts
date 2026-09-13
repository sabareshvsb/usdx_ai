import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";
import type { CmsSettings } from "@/lib/cms-types";

export const revalidate = 0;

/** Public read-model: only published, enabled content is ever returned. */
export async function GET() {
  const client = getPublicClient();

  const [sectionsRes, instructionsRes, announcementsRes, leaderboardRes, settingsRes] =
    await Promise.all([
      client
        .from("cms_sections")
        .select("key, title, heading, subheading, body, image_url, button_text, button_link, sort_order")
        .eq("enabled", true)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      client
        .from("cms_instructions")
        .select("id, title, description, image_url, item_date, link_text, link_url, sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      client
        .from("cms_announcements")
        .select("id, title, message, link_text, link_url, sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      // The table may not be migrated yet in some environments, so a failure
      // here degrades gracefully to an empty leaderboard instead of a 500.
      client
        .from("cms_leaderboard")
        .select("id, name, business_volume, rank, change_24h, avatar_url, updated_at")
        .eq("enabled", true)
        .eq("status", "published")
        .order("rank", { ascending: true })
        .then((res) => {
          if (res.error && (res.error as { code?: string }).code === "42P01") {
            return { data: [] as never[], error: null };
          }
          return res;
        }),
      client.from("cms_settings").select("key, value"),
    ]);

  const settings: CmsSettings = {};
  for (const row of settingsRes.data ?? []) {
    settings[row.key as keyof CmsSettings] = row.value as string;
  }

  return NextResponse.json(
    {
      sections: sectionsRes.data ?? [],
      instructions: instructionsRes.data ?? [],
      announcements: announcementsRes.data ?? [],
      leaderboard: leaderboardRes.data ?? [],
      settings,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}