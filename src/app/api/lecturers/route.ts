import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/lecturers - Get all lecturers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const position = searchParams.get('position')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nidn: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (department) {
      whereClause.department = department
    }

    if (position) {
      whereClause.position = position
    }

    const lecturers = await prisma.lecturer.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        courses: {
          include: {
            krs: true,
            grades: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(lecturers)

  } catch (error) {
    console.error('Error fetching lecturers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lecturers' },
      { status: 500 }
    )
  }
}

// POST /api/lecturers - Create new lecturer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nidn, name, email, phone, position, department } = body

    // Validasi input
    if (!nidn || !name || !email || !position || !department) {
      return NextResponse.json(
        { error: 'NIDN, nama, email, jabatan, dan departemen harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah NIDN sudah ada
    const existingLecturer = await prisma.lecturer.findUnique({
      where: { nidn }
    })

    if (existingLecturer) {
      return NextResponse.json(
        { error: 'NIDN sudah terdaftar' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingEmail = await prisma.lecturer.findUnique({
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
        role: 'LECTURER'
      }
    })

    // Buat lecturer
    const lecturer = await prisma.lecturer.create({
      data: {
        nidn,
        name,
        email,
        phone,
        position,
        department,
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

    return NextResponse.json(lecturer, { status: 201 })

  } catch (error) {
    console.error('Error creating lecturer:', error)
    return NextResponse.json(
      { error: 'Failed to create lecturer' },
      { status: 500 }
    )
  }
}
