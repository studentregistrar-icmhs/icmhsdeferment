import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import crypto from "crypto";

function genId() {
  return (
    "ICMHS-DFR-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    crypto.randomBytes(3).toString("hex").toUpperCase()
  );
}

const REQUIRED = [
  "fullName",
  "email",
  "phone",
  "program",
  "campus",
  "originalIntake",
  "originalYear",
  "deferredIntake",
  "deferredYear",
  "reasonCategory",
  "reasonDetails",
  "signedName"
];

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const id = genId();

  try {
    await sql`
      INSERT INTO deferment_requests (
        id, full_name, student_id, email, phone, program, campus,
        original_intake, original_year, deferred_intake, deferred_year,
        reason_category, reason_details, supporting_notes, signed_name, status
      ) VALUES (
        ${id}, ${body.fullName}, ${body.studentId || null}, ${body.email}, ${body.phone},
        ${body.program}, ${body.campus}, ${body.originalIntake}, ${body.originalYear},
        ${body.deferredIntake}, ${body.deferredYear}, ${body.reasonCategory},
        ${body.reasonDetails}, ${body.supportingNotes || null}, ${body.signedName}, 'pending'
      )
    `;
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("Submit insert failed:", err);
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }
}
