import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/analytics/export - Export analytics report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'
    const range = parseInt(searchParams.get('range') || '30')

    // Get analytics data
    const analyticsResponse = await fetch(`${request.nextUrl.origin}/api/analytics?range=${range}`)
    const analyticsData = await analyticsResponse.json()

    if (format === 'excel') {
      // Generate Excel file
      const excelData = generateExcelData(analyticsData)
      const buffer = Buffer.from(excelData, 'utf-8')
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    } else {
      // Generate PDF file (simplified version)
      const pdfData = generatePDFData(analyticsData)
      
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    }

  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics report' },
      { status: 500 }
    )
  }
}

function generateExcelData(data: any): string {
  // Simplified Excel generation (in real implementation, use a library like xlsx)
  const csvData = [
    ['Laporan Analytics STIM Surakarta'],
    ['Tanggal:', new Date().toLocaleDateString('id-ID')],
    [''],
    ['MAHASISWA'],
    ['Total Mahasiswa', data.students.total],
    ['Mahasiswa Aktif', data.students.active],
    ['Mahasiswa Lulus', data.students.graduated],
    [''],
    ['Mahasiswa per Program:'],
    ...data.students.byProgram.map((item: any) => [item.program, item.count]),
    [''],
    ['Mahasiswa per Semester:'],
    ...data.students.bySemester.map((item: any) => [`Semester ${item.semester}`, item.count]),
    [''],
    ['DOSEN'],
    ['Total Dosen', data.lecturers.total],
    [''],
    ['Dosen per Jabatan:'],
    ...data.lecturers.byPosition.map((item: any) => [item.position, item.count]),
    [''],
    ['Dosen per Departemen:'],
    ...data.lecturers.byDepartment.map((item: any) => [item.department, item.count]),
    [''],
    ['MATA KULIAH'],
    ['Total Mata Kuliah', data.courses.total],
    ['Total SKS', data.courses.totalCredits],
    [''],
    ['Mata Kuliah per Semester:'],
    ...data.courses.bySemester.map((item: any) => [`Semester ${item.semester}`, item.count]),
    [''],
    ['KRS'],
    ['Total KRS', data.krs.total],
    ['Disetujui', data.krs.approved],
    ['Pending', data.krs.pending],
    ['Ditolak', data.krs.rejected],
    [''],
    ['KEUANGAN'],
    ['Total Piutang', `Rp ${data.financial.totalDebt.toLocaleString('id-ID')}`],
    ['Total Pembayaran', `Rp ${data.financial.totalPaid.toLocaleString('id-ID')}`],
    ['Pending', `Rp ${data.financial.pendingAmount.toLocaleString('id-ID')}`],
    ['Jatuh Tempo', `Rp ${data.financial.overdueAmount.toLocaleString('id-ID')}`],
    [''],
    ['PMB'],
    ['Total Pendaftar', data.pmb.totalApplicants],
    ['Diterima', data.pmb.accepted],
    ['Ditolak', data.pmb.rejected],
    ['Terdaftar Ulang', data.pmb.enrolled]
  ]

  return csvData.map(row => row.join(',')).join('\n')
}

function generatePDFData(data: any): string {
  // Simplified PDF generation (in real implementation, use a library like puppeteer or jsPDF)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Analytics STIM Surakarta</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2563eb; text-align: center; }
        h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .summary { background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <h1>Laporan Analytics STIM Surakarta</h1>
      <p style="text-align: center; color: #6b7280;">Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
      
      <div class="summary">
        <h2>Ringkasan</h2>
        <div class="metric">
          <div class="metric-value">${data.students.total}</div>
          <div class="metric-label">Total Mahasiswa</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.lecturers.total}</div>
          <div class="metric-label">Total Dosen</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.courses.total}</div>
          <div class="metric-label">Mata Kuliah</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.krs.total}</div>
          <div class="metric-label">Total KRS</div>
        </div>
      </div>

      <h2>Mahasiswa</h2>
      <table>
        <tr><th>Program Studi</th><th>Jumlah</th></tr>
        ${data.students.byProgram.map((item: any) => 
          `<tr><td>${item.program}</td><td>${item.count}</td></tr>`
        ).join('')}
      </table>

      <h2>Dosen</h2>
      <table>
        <tr><th>Jabatan</th><th>Jumlah</th></tr>
        ${data.lecturers.byPosition.map((item: any) => 
          `<tr><td>${item.position}</td><td>${item.count}</td></tr>`
        ).join('')}
      </table>

      <h2>Keuangan</h2>
      <table>
        <tr><th>Kategori</th><th>Jumlah</th></tr>
        <tr><td>Total Piutang</td><td>Rp ${data.financial.totalDebt.toLocaleString('id-ID')}</td></tr>
        <tr><td>Total Pembayaran</td><td>Rp ${data.financial.totalPaid.toLocaleString('id-ID')}</td></tr>
        <tr><td>Pending</td><td>Rp ${data.financial.pendingAmount.toLocaleString('id-ID')}</td></tr>
        <tr><td>Jatuh Tempo</td><td>Rp ${data.financial.overdueAmount.toLocaleString('id-ID')}</td></tr>
      </table>

      <h2>PMB</h2>
      <table>
        <tr><th>Status</th><th>Jumlah</th></tr>
        <tr><td>Total Pendaftar</td><td>${data.pmb.totalApplicants}</td></tr>
        <tr><td>Diterima</td><td>${data.pmb.accepted}</td></tr>
        <tr><td>Ditolak</td><td>${data.pmb.rejected}</td></tr>
        <tr><td>Terdaftar Ulang</td><td>${data.pmb.enrolled}</td></tr>
      </table>
    </body>
    </html>
  `

  return htmlContent
}
