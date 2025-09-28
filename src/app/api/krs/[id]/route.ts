import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/krs/[id] - Get KRS by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const krs = await prisma.kRS.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nim: true,
            program: true,
            semester: true,
            status: true,
            email: true,
            phone: true
          }
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            semester: true,
            description: true,
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
        }
      }
    })

    if (!krs) {
      return NextResponse.json(
        { error: 'KRS not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(krs)

  } catch (error) {
    console.error('Error fetching KRS:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KRS' },
      { status: 500 }
    )
  }
}

// PUT /api/krs/[id] - Update KRS
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { studentId, courseId, semester, year, status } = body

    // Cek apakah KRS ada
    const existingKRS = await prisma.kRS.findUnique({
      where: { id: params.id }
    })

    if (!existingKRS) {
      return NextResponse.json(
        { error: 'KRS not found' },
        { status: 404 }
      )
    }

    // Validasi jika ada perubahan mahasiswa atau mata kuliah
    if (studentId && studentId !== existingKRS.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      })

      if (!student) {
        return NextResponse.json(
          { error: 'Mahasiswa tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    if (courseId && courseId !== existingKRS.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!course) {
        return NextResponse.json(
          { error: 'Mata kuliah tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Cek duplikasi jika ada perubahan
    if ((studentId && studentId !== existingKRS.studentId) || 
        (courseId && courseId !== existingKRS.courseId) ||
        (semester && semester !== existingKRS.semester)) {
      
      const duplicateKRS = await prisma.kRS.findFirst({
        where: {
          studentId: studentId || existingKRS.studentId,
          courseId: courseId || existingKRS.courseId,
          semester: semester || existingKRS.semester,
          id: { not: params.id }
        }
      })

      if (duplicateKRS) {
        return NextResponse.json(
          { error: 'Mahasiswa sudah mengambil mata kuliah ini di semester tersebut' },
          { status: 400 }
        )
      }
    }

    // Update KRS
    const updatedKRS = await prisma.kRS.update({
      where: { id: params.id },
      data: {
        ...(studentId && { studentId }),
        ...(courseId && { courseId }),
        ...(semester && { semester }),
        ...(year && { year: parseInt(year) }),
        ...(status && { status })
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

    return NextResponse.json(updatedKRS)

  } catch (error) {
    console.error('Error updating KRS:', error)
    return NextResponse.json(
      { error: 'Failed to update KRS' },
      { status: 500 }
    )
  }
}

// DELETE /api/krs/[id] - Delete KRS
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah KRS ada
    const existingKRS = await prisma.kRS.findUnique({
      where: { id: params.id }
    })

    if (!existingKRS) {
      return NextResponse.json(
        { error: 'KRS not found' },
        { status: 404 }
      )
    }

    // Cek apakah KRS sudah memiliki nilai
    const gradesCount = await prisma.grade.count({
      where: { 
        studentId: existingKRS.studentId,
        courseId: existingKRS.courseId,
        semester: existingKRS.semester
      }
    })

    if (gradesCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus KRS yang sudah memiliki nilai' },
        { status: 400 }
      )
    }

    // Hapus KRS
    await prisma.kRS.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'KRS deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting KRS:', error)
    return NextResponse.json(
      { error: 'Failed to delete KRS' },
      { status: 500 }
    )
  }
}

