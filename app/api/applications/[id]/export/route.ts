import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { ICMHS_LOGO_BASE64 } from '../../../../../lib/icmhs-logo';

// If your project doesn't use the "@/..." path alias, change the import
// above to a relative path, e.g. '../../../../../lib/icmhs-logo'.

const sql = neon(process.env.DATABASE_URL!);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rows = await sql`
    SELECT * FROM deferment_requests WHERE id = ${params.id} LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  const r = rows[0] as any;

  const pdfDoc = await PDFDocument.create();
  const page: PDFPage = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoImg = await pdfDoc.embedPng(Buffer.from(ICMHS_LOGO_BASE64, 'base64'));

  const marginX = 50;
  const lineColor = rgb(0.6, 0.6, 0.6);
  const navy = rgb(0.05, 0.15, 0.4);
  let y = height - 40;

  // --- Header ---
  const logoDims = logoImg.scale(0.35);
  page.drawImage(logoImg, { x: marginX, y: y - logoDims.height + 10, width: logoDims.width, height: logoDims.height });
  const headerX = marginX + logoDims.width + 15;
  page.drawText('IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES', { x: headerX, y: y - 5, size: 13, font: bold });
  page.drawText('DEFERMENT FORM', { x: headerX, y: y - 25, size: 11, font });
  page.drawText('(This form is filled by students who want to defer their course to resume later)', {
    x: headerX, y: y - 42, size: 8, font, color: rgb(0.3, 0.3, 0.3),
  });

  y -= logoDims.height + 20;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0, 0, 0) });
  y -= 20;

  // --- Field helper ---
  const drawField = (label: string, value: string, x: number, yy: number, labelWidth = 130, lineLen = 200) => {
    page.drawText(label, { x, y: yy, size: 9, font: bold });
    const lx = x + labelWidth;
    page.drawText(value || '', { x: lx + 3, y: yy, size: 9, font });
    page.drawLine({ start: { x: lx, y: yy - 2 }, end: { x: lx + lineLen, y: yy - 2 }, thickness: 0.7, color: lineColor });
  };

  const fmtDate = (d: string | Date | null) => (d ? new Date(d).toLocaleDateString('en-GB') : '');

  page.drawText('STUDENT DETAILS', { x: marginX, y, size: 10, font: bold, color: navy });
  y -= 18;

  drawField('Admission No:', r.student_id || r.id, marginX, y, 90, 150);
  drawField('Date of Application:', fmtDate(r.submitted_at), marginX + 280, y, 120, 100);
  y -= 20;

  drawField('Student Name:', r.full_name, marginX, y, 90, 220);
  y -= 20;

  drawField('Programme / Intake:', `${r.program} (${r.original_intake} ${r.original_year})`, marginX, y, 120, 330);
  y -= 20;

  drawField('Campus:', r.campus, marginX, y, 90, 200);
  y -= 24;

  page.drawText('Reason for Deferring:', { x: marginX, y, size: 9, font: bold });
  y -= 14;
  const reasonText = `${r.reason_category ? r.reason_category + ' — ' : ''}${r.reason_details || ''}`;
  for (const line of wrapText(reasonText, font, 9, width - marginX * 2)) {
    page.drawText(line, { x: marginX, y, size: 9, font });
    y -= 12;
  }
  y -= 8;

  drawField('Expected Resuming Date:', `${r.deferred_intake} ${r.deferred_year}`, marginX, y, 140, 120);
  drawField('Student Sign:', r.signed_name || '', marginX + 320, y, 75, 130);
  y -= 30;

  // --- Approval chain (blank for physical signing) ---
  const stages: { title: string; extra?: string }[] = [
    { title: 'HEAD OF DEPARTMENT' },
    { title: 'ACCOUNTS', extra: 'Current Fees Balance' },
    { title: 'REGISTRAR' },
    { title: 'PRINCIPAL' },
    { title: 'MANAGING DIRECTOR' },
  ];

  for (const stage of stages) {
    page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 0.5, color: lineColor });
    y -= 14;
    page.drawText(stage.title, { x: marginX, y, size: 9.5, font: bold, color: navy });
    y -= 14;
    if (stage.extra) {
      page.drawText(`${stage.extra}:`, { x: marginX, y, size: 8.5, font });
      page.drawLine({ start: { x: marginX + 90, y: y - 2 }, end: { x: marginX + 250, y: y - 2 }, thickness: 0.7, color: lineColor });
      y -= 14;
    }
    page.drawText('Comments:', { x: marginX, y, size: 8.5, font });
    page.drawLine({ start: { x: marginX + 60, y: y - 2 }, end: { x: width - marginX, y: y - 2 }, thickness: 0.7, color: lineColor });
    y -= 16;
    page.drawText('Approved / Not Approved:', { x: marginX, y, size: 8.5, font });
    page.drawLine({ start: { x: marginX + 130, y: y - 2 }, end: { x: marginX + 230, y: y - 2 }, thickness: 0.7, color: lineColor });
    page.drawText('Sign:', { x: marginX + 250, y, size: 8.5, font });
    page.drawLine({ start: { x: marginX + 275, y: y - 2 }, end: { x: marginX + 380, y: y - 2 }, thickness: 0.7, color: lineColor });
    page.drawText('Date:', { x: marginX + 395, y, size: 8.5, font });
    page.drawLine({ start: { x: marginX + 420, y: y - 2 }, end: { x: width - marginX, y: y - 2 }, thickness: 0.7, color: lineColor });
    y -= 18;
  }

  page.drawText("This form should be filled three (3) days before the leave and in triplicate: one filed in the", {
    x: marginX, y, size: 7, font, color: rgb(0.3, 0.3, 0.3),
  });
  y -= 9;
  page.drawText("department, one in the Registrar's office, and one retained by the student.", {
    x: marginX, y, size: 7, font, color: rgb(0.3, 0.3, 0.3),
  });
  y -= 12;
  page.drawText('PLEASE NOTE: Students cannot have more than one (1) semester deferment simultaneously.', {
    x: marginX, y, size: 7, font: bold, color: rgb(0.5, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Deferment-${r.id}.pdf"`,
    },
  });
}
