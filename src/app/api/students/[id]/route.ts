import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/students/[id] - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
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
        },
        grades: {
          include: {
            course: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nim, name, email, phone, address, program, semester, status } = body

    // Cek apakah student ada
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Cek apakah NIM sudah digunakan oleh student lain
    if (nim && nim !== existingStudent.nim) {
      const duplicateNim = await prisma.student.findFirst({
        where: {
          nim,
          id: { not: params.id }
        }
      })

      if (duplicateNim) {
        return NextResponse.json(
          { error: 'NIM sudah digunakan oleh mahasiswa lain' },
          { status: 400 }
        )
      }
    }

    // Cek apakah email sudah digunakan oleh student lain
    if (email && email !== existingStudent.email) {
      const duplicateEmail = await prisma.student.findFirst({
        where: {
          email,
          id: { not: params.id }
        }
      })

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh mahasiswa lain' },
          { status: 400 }
        )
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        ...(nim && { nim }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(program && { program }),
        ...(semester && { semester: parseInt(semester) }),
        ...(status && { status })
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

    // Update user email jika berubah
    if (email && email !== existingStudent.email) {
      await prisma.user.update({
        where: { id: existingStudent.userId },
        data: { email }
      })
    }

    return NextResponse.json(updatedStudent)

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah student ada
    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Hapus student (akan cascade ke user karena onDelete: Cascade)
    await prisma.student.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
