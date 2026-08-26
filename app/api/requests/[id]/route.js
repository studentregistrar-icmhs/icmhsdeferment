import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "../../../../lib/db";
import { isValidSessionCookie, SESSION_COOKIE } from "../../../../lib/auth";

const ALLOWED_STATUSES = ["pending", "approved", "denied"];

export async function PATCH(request, context) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  let authed = false;
  try {
    authed = isValidSessionCookie(session);
  } catch (err) {
    console.error("Session check failed (likely missing SESSION_SECRET):", err);
    return NextResponse.json({ error: "Server is not fully configured yet." }, { status: 500 });
  }

  if (!authed) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = body.status;
  const reviewerNotes = body.reviewerNotes ?? "";

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const rows = await sql`
      UPDATE deferment_requests
      SET status = ${status}, reviewer_notes = ${reviewerNotes}, reviewed_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    return NextResponse.json({ request: rows[0] });
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ error: "Could not update request." }, { status: 500 });
  }
}
