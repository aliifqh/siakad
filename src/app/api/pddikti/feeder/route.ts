import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// POST /api/pddikti/feeder/report - Generate feeder report untuk PDDIKTI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, semester, academicYear } = body

    if (!reportType || !semester || !academicYear) {
      return NextResponse.json(
        { error: 'reportType, semester, dan academicYear harus diisi' },
        { status: 400 }
      )
    }

    let reportData: unknown = {}

    switch (reportType) {
      case 'mahasiswa':
        reportData = await generateStudentReport(semester)
        break
      case 'dosen':
        reportData = await generateLecturerReport(semester)
        break
      case 'mata_kuliah':
        reportData = await generateCourseReport(semester)
        break
      case 'nilai':
        reportData = await generateGradeReport(semester)
        break
      default:
        return NextResponse.json(
          { error: 'Tipe laporan tidak valid' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      metadata: {
        reportType,
        semester,
        academicYear,
        generatedAt: new Date().toISOString(),
        totalRecords: Array.isArray(reportData) ? reportData.length : 0
      }
    })

  } catch (error) {
    console.error('PDDIKTI feeder report error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate feeder report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Generate laporan mahasiswa untuk PDDIKTI
async function generateStudentReport(semester: number) {
  const students = await prisma.student.findMany({
    where: {
      semester: semester
    },
    include: {
      user: true,
      grades: {
        include: {
          course: true
        }
      }
    }
  })

  return students.map(student => ({
    // Data sesuai format PDDIKTI
    id_mahasiswa: student.id,
    nim: student.nim,
    nama_mahasiswa: student.name,
    email: student.email,
    program_studi: student.program,
    semester: student.semester,
    status_mahasiswa: student.status,
    tanggal_masuk: student.createdAt,
    ipk: calculateGPA(student.grades),
    total_sks: calculateTotalCredits(student.grades),
    // Data tambahan untuk PDDIKTI
    universitas_id: 'STIM_SURAKARTA_ID', // ID STIM di PDDIKTI
    program_studi_id: getProgramId(student.program),
    status_aktif: student.status === 'ACTIVE' ? 'A' : 'T'
  }))
}

// Generate laporan dosen untuk PDDIKTI
async function generateLecturerReport(semester: number) {
  const lecturers = await prisma.lecturer.findMany({
    include: {
      user: true,
      courses: {
        where: {
          semester: semester
        }
      }
    }
  })

  return lecturers.map(lecturer => ({
    // Data sesuai format PDDIKTI
    id_dosen: lecturer.id,
    nidn: lecturer.nidn,
    nama_dosen: lecturer.name,
    email: lecturer.email,
    jabatan_fungsional: lecturer.position,
    program_studi: lecturer.department,
    status_dosen: 'A', // Assuming all lecturers are active
    // Data tambahan untuk PDDIKTI
    universitas_id: 'STIM_SURAKARTA_ID',
    program_studi_id: getProgramId(lecturer.department),
    total_mata_kuliah: lecturer.courses.length
  }))
}

// Generate laporan mata kuliah untuk PDDIKTI
async function generateCourseReport(semester: number) {
  const courses = await prisma.course.findMany({
    where: {
      semester: semester
    },
    include: {
      lecturer: true,
      grades: true
    }
  })

  return courses.map(course => ({
    // Data sesuai format PDDIKTI
    id_mata_kuliah: course.id,
    kode_mata_kuliah: course.code,
    nama_mata_kuliah: course.name,
    sks: course.credits,
    semester: course.semester,
    nama_dosen: course.lecturer?.name,
    nidn_dosen: course.lecturer?.nidn,
    // Data tambahan untuk PDDIKTI
    universitas_id: 'STIM_SURAKARTA_ID',
    program_studi_id: getProgramId(course.lecturer?.department || ''),
    total_peserta: course.grades.length
  }))
}

// Generate laporan nilai untuk PDDIKTI
async function generateGradeReport(semester: number) {
  const grades = await prisma.grade.findMany({
    where: {
      course: {
        semester: semester
      }
    },
    include: {
      student: true,
      course: true
    }
  })

  return grades.map(grade => ({
    // Data sesuai format PDDIKTI
    id_nilai: grade.id,
    nim_mahasiswa: grade.student.nim,
    nama_mahasiswa: grade.student.name,
    kode_mata_kuliah: grade.course.code,
    nama_mata_kuliah: grade.course.name,
    nilai_huruf: grade.grade,
    nilai_angka: convertGradeToNumber(grade.grade),
    sks: grade.course.credits,
    semester: grade.course.semester,
    // Data tambahan untuk PDDIKTI
    universitas_id: 'STIM_SURAKARTA_ID',
    program_studi_id: getProgramId(grade.student.program)
  }))
}

// Helper functions
function calculateGPA(grades: Array<{ course: { credits: number }; grade: string }>): number {
  if (grades.length === 0) return 0
  
  const totalCredits = grades.reduce((sum, grade) => sum + grade.course.credits, 0)
  const totalPoints = grades.reduce((sum, grade) => {
    const points = convertGradeToNumber(grade.grade)
    return sum + (points * grade.course.credits)
  }, 0)
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

function calculateTotalCredits(grades: Array<{ course: { credits: number } }>): number {
  return grades.reduce((sum, grade) => sum + grade.course.credits, 0)
}

function convertGradeToNumber(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D': 1.0,
    'E': 0.0
  }
  return gradeMap[grade] || 0
}

function getProgramId(program: string): string {
  // Mapping program studi ke ID PDDIKTI
  const programMap: { [key: string]: string } = {
    'Teknik Informatika': 'TI_STIM_ID',
    'Sistem Informasi': 'SI_STIM_ID',
    'Manajemen': 'MGT_STIM_ID',
    'Akuntansi': 'AKT_STIM_ID'
  }
  return programMap[program] || 'UNKNOWN_PROGRAM_ID'
}
