import { NextRequest, NextResponse } from 'next/server'
import { pddiktiService } from '@/lib/pddikti'

// GET /api/pddikti/search - Search semua data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter q is required' },
        { status: 400 }
      )
    }

    let results

    switch (type) {
      case 'universitas':
        results = await pddiktiService.searchUniversities(query)
        break
      case 'program':
        results = await pddiktiService.searchPrograms(query)
        break
      case 'dosen':
        results = await pddiktiService.searchLecturers(query)
        break
      case 'mahasiswa':
        results = await pddiktiService.searchStudents(query)
        break
      case 'all':
      default:
        results = await pddiktiService.searchAll(query)
        break
    }

    return NextResponse.json({
      success: true,
      data: results,
      query,
      type
    })

  } catch (error) {
    console.error('PDDIKTI search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search PDDIKTI data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
