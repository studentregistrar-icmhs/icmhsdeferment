import { google } from "googleapis";

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Finds the row for a given admission number (column B) on the
// "MAIN CAMPUS" tab and writes "Deferred - Approved" into column W.
export async function markDeferredApprovedInSheet(admissionNumber) {
  if (!admissionNumber) {
    console.warn("No admission number provided — skipping Sheets update.");
    return { skipped: true };
  }

  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = "MAIN CAMPUS";

  // Read column B to find the matching row
  const colB = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!B:B`,
  });

  const rows = colB.data.values || [];
  const rowIndex = rows.findIndex(
    (row) => (row[0] || "").toString().trim() === admissionNumber.toString().trim()
  );

  if (rowIndex === -1) {
    console.warn(`Admission number ${admissionNumber} not found in sheet.`);
    return { found: false };
  }

  const sheetRowNumber = rowIndex + 1; // sheet rows are 1-indexed

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!W${sheetRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [["Deferred - Approved"]],
    },
  });

  return { found: true, row: sheetRowNumber };
}
async function findInTab(sheets, spreadsheetId, sheetName, admissionNumber) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!B:E`,
  });
  const rows = res.data.values || [];
  const target = admissionNumber.toString().trim().toLowerCase();
  const rowIndex = rows.findIndex(
    (row) => (row[0] || "").toString().trim().toLowerCase() === target
  );
  if (rowIndex === -1) return null;
  const row = rows[rowIndex];
  return {
    name: row[1] || "",         // column C
    programmeRaw: row[3] || "", // column E
  };
}

// Searches MAIN CAMPUS first, then NAKURU CAMPUS. Whichever tab the
// admission number is found in determines the campus — we don't rely
// on column J, since it's not a real per-student value.
export async function lookupStudentByAdmissionNumber(admissionNumber) {
  if (!admissionNumber) return { found: false };
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  let match = await findInTab(sheets, spreadsheetId, "MAIN CAMPUS", admissionNumber);
  if (match) {
    return { found: true, campus: "Thika Main Campus", ...match };
  }

  match = await findInTab(sheets, spreadsheetId, "NAKURU CAMPUS", admissionNumber);
  if (match) {
    return { found: true, campus: "Nakuru Campus", ...match };
  }

  return { found: false };
}