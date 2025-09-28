import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const semester = searchParams.get('semester')
    const lecturerId = searchParams.get('lecturerId')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (semester) {
      whereClause.semester = parseInt(semester)
    }

    if (lecturerId) {
      whereClause.lecturerId = lecturerId
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            nidn: true,
            position: true,
            department: true
          }
        },
        krs: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nim: true
              }
            }
          }
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nim: true
              }
            }
          }
        }
      },
      orderBy: [
        { semester: 'asc' },
        { code: 'asc' }
      ]
    })

    return NextResponse.json(courses)

  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, credits, semester, description, lecturerId } = body

    // Validasi input
    if (!code || !name || !credits || !semester || !lecturerId) {
      return NextResponse.json(
        { error: 'Kode, nama, SKS, semester, dan dosen pengajar harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah kode mata kuliah sudah ada
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Kode mata kuliah sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek apakah dosen ada
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: lecturerId }
    })

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Dosen tidak ditemukan' },
        { status: 400 }
      )
    }

    // Buat course
    const course = await prisma.course.create({
      data: {
        code,
        name,
        credits: parseInt(credits),
        semester: parseInt(semester),
        description,
        lecturerId
      },
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            nidn: true,
            position: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })

  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
