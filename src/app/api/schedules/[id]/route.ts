import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/schedules/[id] - Get specific schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            code: true,
            name: true,
            credits: true
          }
        },
        lecturer: {
          select: {
            name: true,
            nidn: true,
            department: true
          }
        },
        room: {
          select: {
            name: true,
            code: true,
            capacity: true,
            type: true
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(schedule)

  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      courseId, lecturerId, roomId, day, startTime, endTime,
      semester, academicYear, status, notes
    } = body

    // Cek apakah schedule ada
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Cek konflik jadwal jika ada perubahan waktu/ruangan
    if ((roomId && roomId !== existingSchedule.roomId) || 
        (day && day !== existingSchedule.day) ||
        (startTime && startTime !== existingSchedule.startTime) ||
        (endTime && endTime !== existingSchedule.endTime)) {
      
      const conflictingSchedule = await prisma.schedule.findFirst({
        where: {
          roomId: roomId || existingSchedule.roomId,
          day: day || existingSchedule.day,
          status: 'ACTIVE',
          id: { not: params.id },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime || existingSchedule.startTime } },
                { endTime: { gt: startTime || existingSchedule.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endTime || existingSchedule.endTime } },
                { endTime: { gte: endTime || existingSchedule.endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: startTime || existingSchedule.startTime } },
                { endTime: { lte: endTime || existingSchedule.endTime } }
              ]
            }
          ]
        }
      })

      if (conflictingSchedule) {
        return NextResponse.json(
          { error: 'Konflik jadwal: Ruangan sudah digunakan pada waktu tersebut' },
          { status: 400 }
        )
      }
    }

    // Update schedule
    const schedule = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        ...(courseId && { courseId }),
        ...(lecturerId && { lecturerId }),
        ...(roomId && { roomId }),
        ...(day && { day }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(semester && { semester: parseInt(semester) }),
        ...(academicYear && { academicYear }),
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        lecturer: {
          select: {
            name: true,
            nidn: true
          }
        },
        room: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(schedule)

  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah schedule ada
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: params.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Delete schedule
    await prisma.schedule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Schedule deleted successfully' })

  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
