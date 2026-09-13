import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { orUnauthorized } from "@/lib/admin";
import {
  ensureStorageBucket,
  getAdminClient,
  storagePublicUrl,
} from "@/lib/supabase";
import type { CmsMedia } from "@/lib/cms-types";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_SIZE = 12 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET(request: NextRequest) {
  return orUnauthorized(async () => {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

    const admin = getAdminClient();
    let query = admin
      .from("cms_media")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (folder) query = query.eq("folder", folder);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ media: data, count });
  });
}

export async function POST(request: NextRequest) {
  return orUnauthorized(async (adminUser) => {
    await ensureStorageBucket();

    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }

    const folder = slug(String(form.get("folder") ?? "uncategorized")) || "uncategorized";
    const markBanner = form.get("banner") === "true" || form.get("banner") === "1";
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files selected." }, { status: 400 });
    }

    const admin = getAdminClient();
    const created: CmsMedia[] = [];

    for (const file of files) {
      const mime = file.type || "image/png";
      if (!ALLOWED_TYPES.has(mime)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `${file.name} is larger than 12MB.` },
          { status: 400 }
        );
      }

      const ext = EXT_BY_MIME[mime] ?? "png";
      const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin.storage
        .from("cms-media")
        .upload(storagePath, buffer, {
          contentType: mime,
          cacheControl: "31536000",
          upsert: false,
        });
      if (uploadError) {
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const baseName = file.name.replace(/\.[^.]+$/, "");
      const { data, error: insertError } = await admin
        .from("cms_media")
        .insert({
          name: baseName,
          folder,
          storage_path: storagePath,
          url: storagePublicUrl(storagePath),
          size_bytes: file.size,
          mime_type: mime,
          is_banner: markBanner,
          created_by: adminUser.id,
        })
        .select("*")
        .single();
      if (insertError) {
        await admin.storage.from("cms-media").remove([storagePath]);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      created.push(data);
    }

    return NextResponse.json({ media: created });
  });
}