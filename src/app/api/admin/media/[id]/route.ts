import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { orUnauthorized } from "@/lib/admin";
import { ensureStorageBucket, getAdminClient, storagePublicUrl } from "@/lib/supabase";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/media/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const admin = getAdminClient();

    const contentType = request.headers.get("content-type") ?? "";

    // Replacement upload (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      await ensureStorageBucket();
      const form = await request.formData();
      const { data: existing } = await admin
        .from("cms_media")
        .select("*")
        .eq("id", id)
        .single();
      if (!existing) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }

      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "No replacement file provided." },
          { status: 400 }
        );
      }
      const mime = file.type || existing.mime_type;
      if (!ALLOWED_TYPES.has(mime)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}` },
          { status: 400 }
        );
      }

      await admin.storage.from("cms-media").remove([existing.storage_path]);
      const ext = EXT_BY_MIME[mime] ?? "png";
      const storagePath = `${existing.folder}/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await admin.storage
        .from("cms-media")
        .upload(storagePath, buffer, { contentType: mime, upsert: false });
      if (uploadError) {
        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data, error } = await admin
        .from("cms_media")
        .update({
          storage_path: storagePath,
          url: storagePublicUrl(storagePath),
          size_bytes: file.size,
          mime_type: mime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) {
        await admin.storage.from("cms-media").remove([storagePath]);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ media: data });
    }

    // JSON metadata update: name / alt_text / folder / is_banner
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }
    const patch: Record<string, unknown> = {};
    for (const field of ["name", "alt_text", "is_banner"]) {
      if (field in body) patch[field] = body[field];
    }

    if ("folder" in body) {
      const targetFolder =
        String(body.folder).trim().replace(/[^a-z0-9-_]+/gi, "-") || "uncategorized";
      const { data: cur } = await admin
        .from("cms_media")
        .select("*")
        .eq("id", id)
        .single();
      if (cur && cur.folder !== targetFolder) {
        const newPath = `${targetFolder}/${crypto.randomUUID()}-${cur.storage_path.split("/").pop()}`;
        const { error: moveError } = await admin.storage
          .from("cms-media")
          .move(cur.storage_path, newPath);
        if (moveError) {
          return NextResponse.json(
            { error: `Failed to move file: ${moveError.message}` },
            { status: 500 }
          );
        }
        patch.storage_path = newPath;
        patch.url = storagePublicUrl(newPath);
        patch.folder = targetFolder;
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }
    patch.updated_at = new Date().toISOString();

    const { data, error } = await admin
      .from("cms_media")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ media: data });
  });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/media/[id]">
) {
  return orUnauthorized(async () => {
    const { id } = await ctx.params;
    const admin = getAdminClient();
    const { data: existing } = await admin
      .from("cms_media")
      .select("*")
      .eq("id", id)
      .single();
    if (existing) {
      await admin.storage.from("cms-media").remove([existing.storage_path]);
    }
    const { error } = await admin.from("cms_media").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  });
}