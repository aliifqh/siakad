import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/courses/[id] - Get course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            nidn: true,
            position: true,
            department: true,
            email: true,
            phone: true
          }
        },
        krs: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nim: true,
                program: true,
                semester: true
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
                nim: true,
                program: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { code, name, credits, semester, description, lecturerId } = body

    // Cek apakah course ada
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Cek apakah kode sudah digunakan oleh course lain
    if (code && code !== existingCourse.code) {
      const duplicateCode = await prisma.course.findFirst({
        where: {
          code,
          id: { not: params.id }
        }
      })

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Kode mata kuliah sudah digunakan oleh mata kuliah lain' },
          { status: 400 }
        )
      }
    }

    // Cek apakah dosen ada
    if (lecturerId && lecturerId !== existingCourse.lecturerId) {
      const lecturer = await prisma.lecturer.findUnique({
        where: { id: lecturerId }
      })

      if (!lecturer) {
        return NextResponse.json(
          { error: 'Dosen tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(credits && { credits: parseInt(credits) }),
        ...(semester && { semester: parseInt(semester) }),
        ...(description !== undefined && { description }),
        ...(lecturerId && { lecturerId })
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

    return NextResponse.json(updatedCourse)

  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah course ada
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Cek apakah course memiliki KRS atau nilai
    const krsCount = await prisma.kRS.count({
      where: { courseId: params.id }
    })

    const gradesCount = await prisma.grade.count({
      where: { courseId: params.id }
    })

    if (krsCount > 0 || gradesCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus mata kuliah yang memiliki KRS atau nilai' },
        { status: 400 }
      )
    }

    // Hapus course
    await prisma.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
