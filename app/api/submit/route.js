import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { isSemesterYearAllowed } from "../../../lib/deferment";
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
  "admissionNumber",
  "email",
  "phone",
  "applicationDate",
  "program",
  "campus",
  "typeOfDeferment",
  "semesterDeferring",
  "deferYear",
  "resumptionDate",
  "reasonCategory",
  "reasonDetails"
];

const PHONE_PATTERN = /^\+?\d{7,15}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const now = new Date();

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  if (!PHONE_PATTERN.test(body.phone)) {
    return NextResponse.json({ error: "Phone number must contain digits only." }, { status: 400 });
  }

  if (!isSemesterYearAllowed(body.semesterDeferring, body.deferYear, now)) {
    return NextResponse.json(
      { error: "That semester has already passed its deferment deadline, or is not a valid target. Please choose a current or future semester." },
      { status: 400 }
    );
  }

  const id = genId();

  try {
    await sql`
      INSERT INTO deferment_requests (
        id, full_name, admission_number, email, phone, application_date, program, campus,
        type_of_deferment, semester_deferring, defer_year, resumption_date,
        reason_category, reason_details, status
      ) VALUES (
        ${id}, ${body.fullName}, ${body.admissionNumber}, ${body.email}, ${body.phone},
        ${body.applicationDate}, ${body.program}, ${body.campus}, ${body.typeOfDeferment},
        ${body.semesterDeferring}, ${body.deferYear}, ${body.resumptionDate},
        ${body.reasonCategory}, ${body.reasonDetails}, 'pending'
      )
    `;
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("Submit insert failed:", err);
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }
}
