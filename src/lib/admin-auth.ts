import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Verify the current request is from an authenticated ADMIN user.
 * Returns the session if authorized, or a 403 NextResponse if not.
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return session;
}

/** Type guard: returns true if the value is a NextResponse (i.e. auth failed) */
export function isUnauthorized(
  result: Awaited<ReturnType<typeof requireAdmin>>
): result is NextResponse<{ error: string }> {
  return result instanceof NextResponse;
}
