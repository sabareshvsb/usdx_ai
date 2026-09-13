import "server-only";
import { getSessionAdmin } from "@/lib/auth";
import type { AdminUser } from "@/lib/cms-types";

/**
 * Server-only authorization guard for admin Route Handlers.
 * Throws when the request is not backed by a valid admin session.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getSessionAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Wrap an admin handler so any unauthenticated request becomes a 401 JSON
 * response instead of an exception.
 */
export async function orUnauthorized<T>(
  run: (admin: AdminUser) => Promise<T>
): Promise<Response | T> {
  try {
    const admin = await requireAdmin();
    return await run(admin);
  } catch {
    return unauthorized();
  }
}