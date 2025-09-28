import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/pmb - Get all PMB applicants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const program = searchParams.get('program')

    const whereClause: Record<string, unknown> = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { program: { contains: search, mode: 'insensitive' } },
        { school: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (program) {
      whereClause.program = program
    }

    const applicants = await prisma.pMBApplicant.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(applicants)

  } catch (error) {
    console.error('Error fetching PMB applicants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PMB applicants' },
      { status: 500 }
    )
  }
}

// POST /api/pmb - Create new PMB applicant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, email, phone, address, birthDate, birthPlace, gender, religion,
      nationality, program, education, school, yearGraduated, parentName,
      parentPhone, parentJob, status = 'REGISTERED', testScore, interviewScore,
      finalScore, notes
    } = body

    // Validasi input wajib
    if (!name || !email || !phone || !address || !birthDate || !birthPlace || 
        !gender || !program || !education || !school || !yearGraduated || 
        !parentName || !parentPhone || !parentJob) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingApplicant = await prisma.pMBApplicant.findUnique({
      where: { email }
    })

    if (existingApplicant) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Buat applicant
    const applicant = await prisma.pMBApplicant.create({
      data: {
        name,
        email,
        phone,
        address,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        religion: religion || 'Islam',
        nationality: nationality || 'Indonesia',
        program,
        education,
        school,
        yearGraduated: parseInt(yearGraduated),
        parentName,
        parentPhone,
        parentJob,
        status,
        testScore: testScore ? parseFloat(testScore) : null,
        interviewScore: interviewScore ? parseFloat(interviewScore) : null,
        finalScore: finalScore ? parseFloat(finalScore) : null,
        notes
      }
    })

    return NextResponse.json(applicant, { status: 201 })

  } catch (error) {
    console.error('Error creating PMB applicant:', error)
    return NextResponse.json(
      { error: 'Failed to create PMB applicant' },
      { status: 500 }
    )
  }
}

