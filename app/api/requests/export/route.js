import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "../../../../lib/db";
import { isValidSessionCookie, SESSION_COOKIE } from "../../../../lib/auth";
import { generateRequestsExcel } from "../../../../lib/excel";

const VALID_STATUSES = ["pending", "approved", "denied"];

export async function GET(request) {
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

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = VALID_STATUSES.includes(statusParam) ? statusParam : null;

  try {
    const rows = status
      ? await sql`SELECT * FROM deferment_requests WHERE status = ${status} ORDER BY submitted_at DESC`
      : await sql`SELECT * FROM deferment_requests ORDER BY submitted_at DESC`;

    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "All";
    const buffer = await generateRequestsExcel(rows, label);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="icmhs-deferment-requests-${label.toLowerCase()}.xlsx"`
      }
    });
  } catch (err) {
    console.error("Bulk export failed:", err);
    return NextResponse.json({ error: "Could not generate spreadsheet." }, { status: 500 });
  }
}
