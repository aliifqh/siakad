import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { Student } from '@/types'

// GET /api/students - Get all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const program = searchParams.get('program')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
        { program: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (program) {
      whereClause.program = program
    }

    if (status) {
      whereClause.status = status
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        krs: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(students)

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nim, name, email, phone, address, program, semester, status = 'ACTIVE' } = body

    // Validasi input
    if (!nim || !name || !email || !program || !semester) {
      return NextResponse.json(
        { error: 'NIM, nama, email, program, dan semester harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah NIM sudah ada
    const existingStudent = await prisma.student.findUnique({
      where: { nim }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIM sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingEmail = await prisma.student.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Buat user terlebih dahulu
    const user = await prisma.user.create({
      data: {
        email,
        password: '$2a$12$default.password.hash', // Default password, harus diubah saat login pertama
        role: 'STUDENT'
      }
    })

    // Buat student
    const student = await prisma.student.create({
      data: {
        nim,
        name,
        email,
        phone,
        address,
        program,
        semester: parseInt(semester),
        status,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(student, { status: 201 })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
