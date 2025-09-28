import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { RegisterRequest, LoginRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, studentData, lecturerData }: RegisterRequest = body

    // Validasi input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, dan role harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Buat user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    })

    // Buat data mahasiswa jika role adalah STUDENT
    if (role === 'STUDENT' && studentData) {
      await prisma.student.create({
        data: {
          nim: studentData.nim,
          name: studentData.name,
          email,
          program: studentData.program,
          semester: studentData.semester,
          userId: user.id
        }
      })
    }

    // Buat data dosen jika role adalah LECTURER
    if (role === 'LECTURER' && lecturerData) {
      await prisma.lecturer.create({
        data: {
          nidn: lecturerData.nidn,
          name: lecturerData.name,
          email,
          position: lecturerData.position,
          department: lecturerData.department,
          userId: user.id
        }
      })
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })

    return NextResponse.json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
