import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/rooms - Get all rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type) {
      whereClause.type = type
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        schedules: {
          where: {
            status: 'ACTIVE'
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
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(rooms)

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, code, capacity, type, location, facilities, isActive = true
    } = body

    // Validasi input
    if (!name || !code || !capacity || !type || !location) {
      return NextResponse.json(
        { error: 'Nama, kode, kapasitas, tipe, dan lokasi harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah kode sudah ada
    const existingRoom = await prisma.room.findUnique({
      where: { code }
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Kode ruangan sudah digunakan' },
        { status: 400 }
      )
    }

    // Buat room
    const room = await prisma.room.create({
      data: {
        name,
        code,
        capacity: parseInt(capacity),
        type,
        location,
        facilities,
        isActive
      }
    })

    return NextResponse.json(room, { status: 201 })

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
