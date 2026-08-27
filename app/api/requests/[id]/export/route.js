import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "../../../../../lib/db";
import { isValidSessionCookie, SESSION_COOKIE } from "../../../../../lib/auth";
import { generateSingleRequestPdf } from "../../../../../lib/pdf";

export async function GET(request, context) {
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

  try {
    const rows = await sql`SELECT * FROM deferment_requests WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    const bytes = await generateSingleRequestPdf(rows[0]);
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${id}.pdf"`
      }
    });
  } catch (err) {
    console.error("Single export failed:", err);
    return NextResponse.json({ error: "Could not generate PDF." }, { status: 500 });
  }
}
