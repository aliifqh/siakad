import { NextRequest, NextResponse } from 'next/server'
import { pddiktiService } from '@/lib/pddikti'

// GET /api/pddikti/sync/student - Sync student data dari PDDIKTI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nim = searchParams.get('nim')

    if (!nim) {
      return NextResponse.json(
        { error: 'NIM parameter is required' },
        { status: 400 }
      )
    }

    const studentData = await pddiktiService.syncStudentData(nim)

    if (!studentData) {
      return NextResponse.json(
        { error: 'Student not found in PDDIKTI' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: studentData,
      message: 'Student data synced successfully'
    })

  } catch (error) {
    console.error('PDDIKTI student sync error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync student data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
