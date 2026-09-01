import { google } from "googleapis";

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Finds the row for a given admission number (column A) on the given tab.
async function findRowNumberInTab(sheets, spreadsheetId, sheetName, admissionNumber, idColumn = "B") {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${idColumn}:${idColumn}`,
  });
  const rows = res.data.values || [];
  const target = admissionNumber.toString().trim().toLowerCase();
  const rowIndex = rows.findIndex(
    (row) => (row[0] || "").toString().trim().toLowerCase() === target
  );
  return rowIndex === -1 ? null : rowIndex + 1; // sheet rows are 1-indexed
}

// New semester (Sept-Dec 2026+): status is written into column C of a
// single "STATUS LOG" tab, keyed by admission number in column A.
// Pass an empty string "" to clear the cell (used when an application
// is denied or reset to pending).
const STATUS_LOG_TAB = "STATUS LOG";
const STATUS_LOG_ID_COLUMN = "A";
const STATUS_LOG_STATUS_COLUMN = "C";

export async function updateDefermentStatusInSheet(admissionNumber, statusText) {
  if (!admissionNumber) {
    console.warn("No admission number provided — skipping Sheets update.");
    return { skipped: true };
  }

  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const rowNumber = await findRowNumberInTab(
    sheets,
    spreadsheetId,
    STATUS_LOG_TAB,
    admissionNumber,
    STATUS_LOG_ID_COLUMN
  );

  if (rowNumber) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${STATUS_LOG_TAB}!${STATUS_LOG_STATUS_COLUMN}${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [[statusText]] },
    });
    return { found: true, sheet: STATUS_LOG_TAB, row: rowNumber };
  }

  console.warn(`Admission number ${admissionNumber} not found in ${STATUS_LOG_TAB}.`);
  return { found: false };
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