import { NextResponse } from "next/server";
import { orUnauthorized } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase";
import { generateTotpSecret, totpUri } from "@/lib/auth";

/** Generate a fresh TOTP secret + otpauth URI for enabling 2FA. */
export async function POST() {
  return orUnauthorized(async (admin) => {
    const secret = generateTotpSecret();
    const uri = totpUri(secret, admin.email);
    return NextResponse.json({ secret, uri });
  });
}