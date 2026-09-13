import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Client used for PUBLIC read endpoints. RLS ensures only published content is returned. */
export function getPublicClient(): SupabaseClient {
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase public env configuration.");
  }
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client used for ADMIN writes / storage. Service role bypasses RLS — keep server-only. */
export function getAdminClient(): SupabaseClient {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase service role configuration.");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const storageBucket = "cms-media";
export function storagePublicUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${path}`;
}

/** Ensure the storage bucket exists (idempotent). Run once per deploy / first upload. */
export async function ensureStorageBucket() {
  const admin = getAdminClient();
  const { error } = await admin.storage.getBucket(storageBucket);
  if (error) {
    await admin.storage.createBucket(storageBucket, {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
    });
  }
}