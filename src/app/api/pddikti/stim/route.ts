import { NextRequest, NextResponse } from 'next/server'
import { pddiktiService } from '@/lib/pddikti'

// GET /api/pddikti/stim - Get STIM Surakarta data dari PDDIKTI
export async function GET() {
  try {
    const stimData = await pddiktiService.getSTIMData()

    if (!stimData) {
      return NextResponse.json(
        { error: 'STIM Surakarta not found in PDDIKTI' },
        { status: 404 }
      )
    }

    // Get programs dari STIM
    const programs = await pddiktiService.getUniversityPrograms(stimData.id)

    return NextResponse.json({
      success: true,
      data: {
        university: stimData,
        programs: programs
      },
      message: 'STIM data retrieved successfully'
    })

  } catch (error) {
    console.error('PDDIKTI STIM data error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch STIM data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
