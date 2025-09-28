import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const day = searchParams.get('day')
    const status = searchParams.get('status')
    const semester = searchParams.get('semester')
    const academicYear = searchParams.get('academicYear')

    const whereClause: Record<string, unknown> = {}

    if (search) {
      whereClause.OR = [
        { course: { name: { contains: search, mode: 'insensitive' } } },
        { course: { code: { contains: search, mode: 'insensitive' } } },
        { lecturer: { name: { contains: search, mode: 'insensitive' } } },
        { room: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (day) {
      whereClause.day = day
    }

    if (status) {
      whereClause.status = status
    }

    if (semester) {
      whereClause.semester = parseInt(semester)
    }

    if (academicYear) {
      whereClause.academicYear = academicYear
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(schedules)

  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      courseId, lecturerId, roomId, day, startTime, endTime,
      semester, academicYear, status = 'ACTIVE', notes
    } = body

    // Validasi input
    if (!courseId || !lecturerId || !roomId || !day || !startTime || !endTime || !semester || !academicYear) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah course ada
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 400 }
      )
    }

    // Cek apakah lecturer ada
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: lecturerId }
    })

    if (!lecturer) {
      return NextResponse.json(
        { error: 'Dosen tidak ditemukan' },
        { status: 400 }
      )
    }

    // Cek apakah room ada dan aktif
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Ruangan tidak ditemukan' },
        { status: 400 }
      )
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Ruangan tidak aktif' },
        { status: 400 }
      )
    }

    // Cek konflik jadwal
    const conflictingSchedule = await prisma.schedule.findFirst({
      where: {
        roomId,
        day,
        status: 'ACTIVE',
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
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

    // Buat schedule
    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        lecturerId,
        roomId,
        day,
        startTime,
        endTime,
        semester: parseInt(semester),
        academicYear,
        status,
        notes
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

    return NextResponse.json(schedule, { status: 201 })

  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
