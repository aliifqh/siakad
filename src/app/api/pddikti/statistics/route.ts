import { NextResponse } from 'next/server'
import { pddiktiService } from '@/lib/pddikti'

// GET /api/pddikti/statistics - Get PDDIKTI statistics
export async function GET() {
  try {
    const statistics = await pddiktiService.getStatistics()

    return NextResponse.json({
      success: true,
      data: statistics,
      message: 'Statistics retrieved successfully'
    })

  } catch (error) {
    console.error('PDDIKTI statistics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
