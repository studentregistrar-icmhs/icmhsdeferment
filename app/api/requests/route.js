import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "../../../lib/db";
import { isValidSessionCookie, SESSION_COOKIE } from "../../../lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!isValidSessionCookie(session)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT * FROM deferment_requests ORDER BY submitted_at DESC
    `;
    return NextResponse.json({ requests: rows });
  } catch (err) {
    console.error("List fetch failed:", err);
    return NextResponse.json({ error: "Could not load requests." }, { status: 500 });
  }
}
