import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import ExcelJS from 'exceljs';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/applications/export            -> all applications
// GET /api/applications/export?status=pending  -> only that status
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');

  const rows = status
    ? await sql`SELECT * FROM deferment_requests WHERE status = ${status} ORDER BY submitted_at DESC`
    : await sql`SELECT * FROM deferment_requests ORDER BY submitted_at DESC`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Deferment Applications');

  sheet.columns = [
    { header: 'Application ID', key: 'id', width: 26 },
    { header: 'Student Name', key: 'full_name', width: 24 },
    { header: 'Admission No', key: 'student_id', width: 16 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Programme', key: 'program', width: 34 },
    { header: 'Campus', key: 'campus', width: 16 },
    { header: 'Original Intake', key: 'original_intake', width: 14 },
    { header: 'Original Year', key: 'original_year', width: 12 },
    { header: 'Deferred To Intake', key: 'deferred_intake', width: 16 },
    { header: 'Deferred To Year', key: 'deferred_year', width: 14 },
    { header: 'Reason Category', key: 'reason_category', width: 18 },
    { header: 'Reason Details', key: 'reason_details', width: 40 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Reviewer Notes', key: 'reviewer_notes', width: 30 },
    { header: 'Submitted At', key: 'submitted_at', width: 18 },
    { header: 'Reviewed At', key: 'reviewed_at', width: 18 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1F3A' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.autoFilter = { from: 'A1', to: 'Q1' };

  for (const r of rows as any[]) {
    sheet.addRow({
      ...r,
      submitted_at: r.submitted_at ? new Date(r.submitted_at).toLocaleString('en-GB') : '',
      reviewed_at: r.reviewed_at ? new Date(r.reviewed_at).toLocaleString('en-GB') : '',
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = status ? `deferment-applications-${status}.xlsx` : 'deferment-applications-all.xlsx';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
