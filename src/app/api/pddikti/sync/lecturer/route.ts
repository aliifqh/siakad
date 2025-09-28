import { NextRequest, NextResponse } from 'next/server'
import { pddiktiService } from '@/lib/pddikti'

// GET /api/pddikti/sync/lecturer - Sync lecturer data dari PDDIKTI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nidn = searchParams.get('nidn')

    if (!nidn) {
      return NextResponse.json(
        { error: 'NIDN parameter is required' },
        { status: 400 }
      )
    }

    const lecturerData = await pddiktiService.syncLecturerData(nidn)

    if (!lecturerData) {
      return NextResponse.json(
        { error: 'Lecturer not found in PDDIKTI' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lecturerData,
      message: 'Lecturer data synced successfully'
    })

  } catch (error) {
    console.error('PDDIKTI lecturer sync error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync lecturer data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
