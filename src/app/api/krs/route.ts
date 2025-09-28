import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/krs - Get all KRS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const semester = searchParams.get('semester')
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { student: { nim: { contains: search, mode: 'insensitive' } } },
        { course: { name: { contains: search, mode: 'insensitive' } } },
        { course: { code: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (semester) {
      whereClause.semester = semester
    }

    if (year) {
      whereClause.year = parseInt(year)
    }

    if (status) {
      whereClause.status = status
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    const krsList = await prisma.kRS.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nim: true,
            program: true,
            semester: true,
            status: true
          }
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            semester: true,
            lecturer: {
              select: {
                name: true,
                nidn: true
              }
            }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(krsList)

  } catch (error) {
    console.error('Error fetching KRS:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KRS' },
      { status: 500 }
    )
  }
}

// POST /api/krs - Create new KRS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, courseId, semester, year, status = 'PENDING' } = body

    // Validasi input
    if (!studentId || !courseId || !semester || !year) {
      return NextResponse.json(
        { error: 'Mahasiswa, mata kuliah, semester, dan tahun harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah mahasiswa ada
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 400 }
      )
    }

    // Cek apakah mata kuliah ada
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 400 }
      )
    }

    // Cek apakah KRS sudah ada untuk mahasiswa dan mata kuliah di semester yang sama
    const existingKRS = await prisma.kRS.findFirst({
      where: {
        studentId,
        courseId,
        semester
      }
    })

    if (existingKRS) {
      return NextResponse.json(
        { error: 'Mahasiswa sudah mengambil mata kuliah ini di semester tersebut' },
        { status: 400 }
      )
    }

    // Cek apakah mahasiswa sudah mengambil terlalu banyak SKS
    const currentSemesterKRS = await prisma.kRS.findMany({
      where: {
        studentId,
        semester,
        status: { not: 'REJECTED' }
      },
      include: {
        course: true
      }
    })

    const totalCredits = currentSemesterKRS.reduce((sum, krs) => sum + krs.course.credits, 0)
    const newTotalCredits = totalCredits + course.credits

    if (newTotalCredits > 24) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak dapat mengambil lebih dari 24 SKS per semester' },
        { status: 400 }
      )
    }

    // Buat KRS
    const krs = await prisma.kRS.create({
      data: {
        studentId,
        courseId,
        semester,
        year: parseInt(year),
        status
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nim: true,
            program: true,
            semester: true
          }
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            semester: true,
            lecturer: {
              select: {
                name: true,
                nidn: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(krs, { status: 201 })

  } catch (error) {
    console.error('Error creating KRS:', error)
    return NextResponse.json(
      { error: 'Failed to create KRS' },
      { status: 500 }
    )
  }
}

