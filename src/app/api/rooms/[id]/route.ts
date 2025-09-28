import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/rooms/[id] - Get, update, or delete specific room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        schedules: {
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
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)

  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

// PUT /api/rooms/[id] - Update room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name, code, capacity, type, location, facilities, isActive
    } = body

    // Cek apakah room ada
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Cek apakah kode sudah digunakan oleh room lain
    if (code && code !== existingRoom.code) {
      const codeExists = await prisma.room.findUnique({
        where: { code }
      })

      if (codeExists) {
        return NextResponse.json(
          { error: 'Kode ruangan sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update room
    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(type && { type }),
        ...(location && { location }),
        ...(facilities !== undefined && { facilities }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(room)

  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/[id] - Delete room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Cek apakah room ada
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        schedules: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Cek apakah ada jadwal aktif
    if (existingRoom.schedules.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus ruangan yang memiliki jadwal aktif' },
        { status: 400 }
      )
    }

    // Delete room
    await prisma.room.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Room deleted successfully' })

  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
