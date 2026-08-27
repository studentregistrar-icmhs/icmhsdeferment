import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const NAVY = rgb(11 / 255, 37 / 255, 69 / 255);
const GOLD = rgb(201 / 255, 162 / 255, 39 / 255);
const INK = rgb(0.11, 0.14, 0.19);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.87, 0.9);
const PAGE = [595.28, 841.89]; // A4
const MARGIN = 40;

function fmt(v) {
  return v === null || v === undefined || String(v).trim() === "" ? "—" : String(v);
}

function statusColor(status) {
  if (status === "approved") return rgb(0.18, 0.49, 0.31);
  if (status === "denied") return rgb(0.64, 0.15, 0.22);
  return rgb(0.54, 0.42, 0.06);
}

class PdfWriter {
  constructor(pdf, font, bold) {
    this.pdf = pdf;
    this.font = font;
    this.bold = bold;
    this.width = PAGE[0];
    this.height = PAGE[1];
    this.page = pdf.addPage(PAGE);
    this.y = this.height - MARGIN;
  }

  newPage() {
    this.page = this.pdf.addPage(PAGE);
    this.y = this.height - MARGIN;
  }

  ensureSpace(h) {
    if (this.y - h < MARGIN) this.newPage();
  }

  drawHeader(title, subtitle) {
    this.page.drawRectangle({ x: 0, y: this.height - 70, width: this.width, height: 70, color: NAVY });
    this.page.drawText("IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES", {
      x: MARGIN, y: this.height - 28, size: 9, font: this.bold, color: GOLD
    });
    this.page.drawText(title, { x: MARGIN, y: this.height - 46, size: 14, font: this.bold, color: rgb(1, 1, 1) });
    if (subtitle) {
      this.page.drawText(subtitle, { x: MARGIN, y: this.height - 62, size: 9, font: this.font, color: rgb(0.85, 0.85, 0.9) });
    }
    this.y = this.height - 100;
  }

  sectionTitle(t) {
    this.ensureSpace(40);
    this.y -= 6;
    this.page.drawText(t, { x: MARGIN, y: this.y, size: 12, font: this.bold, color: NAVY });
    this.y -= 6;
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: this.width - MARGIN, y: this.y }, thickness: 1, color: LINE });
    this.y -= 18;
  }

  wrapText(text, size, maxWidth, font = this.font) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  row(label, value) {
    this.ensureSpace(36);
    this.page.drawText(label.toUpperCase(), { x: MARGIN, y: this.y, size: 8, font: this.bold, color: MUTED });
    this.y -= 14;
    const lines = this.wrapText(fmt(value), 11, this.width - MARGIN * 2);
    for (const line of lines) {
      this.ensureSpace(16);
      this.page.drawText(line, { x: MARGIN, y: this.y, size: 11, font: this.font, color: INK });
      this.y -= 16;
    }
    this.y -= 8;
  }
}

export async function generateSingleRequestPdf(r) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const w = new PdfWriter(pdf, font, bold);

  w.drawHeader("Enrollment Deferment Request", `Reference: ${fmt(r.id)}  ·  Office of Admissions & Records`);

  w.sectionTitle("Applicant Information");
  w.row("Full Name", r.full_name);
  w.row("Admission Number", r.admission_number);
  w.row("Email", r.email);
  w.row("Phone", r.phone);
  w.row("Application Date", r.application_date);

  w.sectionTitle("Program & Campus");
  w.row("Program", r.program);
  w.row("Campus", r.campus);

  w.sectionTitle("Deferment Details");
  w.row("Type of Deferment", r.type_of_deferment);
  w.row("Semester Deferring", `${fmt(r.semester_deferring)} ${fmt(r.defer_year)}`);
  w.row("Resumption Date", r.resumption_date);

  w.sectionTitle("Reason for Deferment");
  w.row("Category", r.reason_category);
  w.row("Explanation", r.reason_details);

  w.sectionTitle("Registrar Review");
  w.row("Status", (r.status || "").toUpperCase());
  w.row("Reviewer Notes", r.reviewer_notes);
  w.row("Submitted At", r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—");
  w.row("Reviewed At", r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : "—");

  return pdf.save();
}

export async function generateBulkRequestsPdf(records, label = "All") {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const w = new PdfWriter(pdf, font, bold);

  w.drawHeader(
    `Deferment Requests — ${label}`,
    `Exported ${new Date().toLocaleString()}  ·  ${records.length} record(s)`
  );

  if (records.length === 0) {
    w.page.drawText("No requests match this export.", { x: MARGIN, y: w.y, size: 12, font, color: INK });
  }

  for (const r of records) {
    w.ensureSpace(70);
    w.page.drawText(fmt(r.full_name), { x: MARGIN, y: w.y, size: 12, font: bold, color: NAVY });
    const statusText = String(r.status || "").toUpperCase();
    const statusWidth = bold.widthOfTextAtSize(statusText, 9);
    w.page.drawText(statusText, {
      x: w.width - MARGIN - statusWidth,
      y: w.y,
      size: 9,
      font: bold,
      color: statusColor(r.status)
    });
    w.y -= 16;

    const line1 = `${fmt(r.id)}  ·  Adm: ${fmt(r.admission_number)}  ·  ${fmt(r.program)}`;
    for (const l of w.wrapText(line1, 9, w.width - MARGIN * 2)) {
      w.ensureSpace(12);
      w.page.drawText(l, { x: MARGIN, y: w.y, size: 9, font, color: MUTED });
      w.y -= 12;
    }

    const line2 = `${fmt(r.campus)}  ·  Deferring: ${fmt(r.semester_deferring)} ${fmt(r.defer_year)}  ·  Resumes: ${fmt(r.resumption_date)}  ·  Filed: ${r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}`;
    for (const l of w.wrapText(line2, 9, w.width - MARGIN * 2)) {
      w.ensureSpace(12);
      w.page.drawText(l, { x: MARGIN, y: w.y, size: 9, font, color: MUTED });
      w.y -= 12;
    }

    w.y -= 6;
    w.ensureSpace(1);
    w.page.drawLine({ start: { x: MARGIN, y: w.y }, end: { x: w.width - MARGIN, y: w.y }, thickness: 0.5, color: LINE });
    w.y -= 14;
  }

  return pdf.save();
}
