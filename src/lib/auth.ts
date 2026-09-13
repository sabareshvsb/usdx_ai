import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase";
import type { AdminUser } from "@/lib/cms-types";

export const SESSION_COOKIE = "usdx_admin_session";
export const SESSION_TTL_DAYS = 7;

export const shapeAdmin = (row: Record<string, unknown>): AdminUser => ({
  id: String(row.id),
  email: String(row.email),
  name: String(row.name ?? "Administrator"),
  role: String(row.role ?? "admin"),
  two_factor_enabled: Boolean(row.two_factor_enabled),
  last_login_at: (row.last_login_at as string | null) ?? null,
  created_at: String(row.created_at),
});

/* ------------------------------------------------------------------ */
/* Password hashing (scrypt, built-in crypto — no extra dependencies)  */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("base64");
  const key = crypto.scryptSync(password, Buffer.from(salt, "base64"), 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$16384$8$1$${salt}$${key.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = parseInt(n, 10);
    const R = parseInt(r, 10);
    const P = parseInt(p, 10);
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const actual = crypto.scryptSync(password, salt, expected.length, {
      N,
      r: R,
      p: P,
      maxmem: 64 * 1024 * 1024,
    });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* TOTP (2FA) — RFC 6238, HMAC-SHA1, 30s window                         */
/* ------------------------------------------------------------------ */

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    value = (value << 5) | B32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function totpUri(secret: string, email: string): string {
  return `otpauth://totp/USDX%20AI%20Admin:${encodeURIComponent(
    email
  )}?secret=${secret}&issuer=USDX%20AI%20Admin&period=30&digits=6`;
}

function totpAtTime(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter), 0);
  const hmac = crypto.createHmac("sha1", key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let i = -1; i <= 1; i++) {
    if (totpAtTime(secret, counter + i) === code) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function getSessionAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const admin = getAdminClient();
  const tokenHash = sha256(token);
  const { data, error } = await admin
    .from("admin_sessions")
    .select("admin_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt < Date.now()) {
    await admin.from("admin_sessions").delete().eq("token_hash", tokenHash);
    return null;
  }

  const { data: adminRow } = await admin
    .from("admins")
    .select("*")
    .eq("id", data.admin_id)
    .maybeSingle();

  if (!adminRow || adminRow.status !== "active") return null;

  return shapeAdmin(adminRow);
}

export async function createSession(
  adminId: string,
  ctx?: { userAgent?: string; ip?: string }
) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const admin = getAdminClient();
  const { error } = await admin.from("admin_sessions").insert({
    admin_id: adminId,
    token_hash: sha256(token),
    expires_at: expiresAt.toISOString(),
    user_agent: ctx?.userAgent ?? null,
    ip: ctx?.ip ?? null,
  });
  if (error) throw new Error("Failed to create session");

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const admin = getAdminClient();
    await admin.from("admin_sessions").delete().eq("token_hash", sha256(token));
  }
  store.delete(SESSION_COOKIE);
}

export async function touchLogin(adminId: string) {
  const admin = getAdminClient();
  await admin
    .from("admins")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", adminId);
}