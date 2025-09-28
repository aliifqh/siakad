import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/lecturers/[id] - Get lecturer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: params.id },
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
            krs: {
              include: {
                student: true
              }
            },
            grades: {
              include: {
                student: true
              }
            }
          }
        }
      }
    })

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Lecturer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lecturer)

  } catch (error) {
    console.error('Error fetching lecturer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lecturer' },
      { status: 500 }
    )
  }
}

// PUT /api/lecturers/[id] - Update lecturer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nidn, name, email, phone, position, department } = body

    // Cek apakah lecturer ada
    const existingLecturer = await prisma.lecturer.findUnique({
      where: { id: params.id }
    })

    if (!existingLecturer) {
      return NextResponse.json(
        { error: 'Lecturer not found' },
        { status: 404 }
      )
    }

    // Cek apakah NIDN sudah digunakan oleh lecturer lain
    if (nidn && nidn !== existingLecturer.nidn) {
      const duplicateNidn = await prisma.lecturer.findFirst({
        where: {
          nidn,
          id: { not: params.id }
        }
      })

      if (duplicateNidn) {
        return NextResponse.json(
          { error: 'NIDN sudah digunakan oleh dosen lain' },
          { status: 400 }
        )
      }
    }

    // Cek apakah email sudah digunakan oleh lecturer lain
    if (email && email !== existingLecturer.email) {
      const duplicateEmail = await prisma.lecturer.findFirst({
        where: {
          email,
          id: { not: params.id }
        }
      })

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh dosen lain' },
          { status: 400 }
        )
      }
    }

    // Update lecturer
    const updatedLecturer = await prisma.lecturer.update({
      where: { id: params.id },
      data: {
        ...(nidn && { nidn }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(position && { position }),
        ...(department && { department })
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
    if (email && email !== existingLecturer.email) {
      await prisma.user.update({
        where: { id: existingLecturer.userId },
        data: { email }
      })
    }

    return NextResponse.json(updatedLecturer)

  } catch (error) {
    console.error('Error updating lecturer:', error)
    return NextResponse.json(
      { error: 'Failed to update lecturer' },
      { status: 500 }
    )
  }
}

// DELETE /api/lecturers/[id] - Delete lecturer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah lecturer ada
    const existingLecturer = await prisma.lecturer.findUnique({
      where: { id: params.id }
    })

    if (!existingLecturer) {
      return NextResponse.json(
        { error: 'Lecturer not found' },
        { status: 404 }
      )
    }

    // Cek apakah lecturer memiliki mata kuliah
    const coursesCount = await prisma.course.count({
      where: { lecturerId: params.id }
    })

    if (coursesCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus dosen yang memiliki mata kuliah' },
        { status: 400 }
      )
    }

    // Hapus lecturer (akan cascade ke user karena onDelete: Cascade)
    await prisma.lecturer.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Lecturer deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting lecturer:', error)
    return NextResponse.json(
      { error: 'Failed to delete lecturer' },
      { status: 500 }
    )
  }
}
