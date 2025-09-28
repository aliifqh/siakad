import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/pmb/[id] - Get PMB applicant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const applicant = await prisma.pMBApplicant.findUnique({
      where: { id }
    })

    if (!applicant) {
      return NextResponse.json(
        { error: 'PMB applicant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(applicant)

  } catch (error) {
    console.error('Error fetching PMB applicant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PMB applicant' },
      { status: 500 }
    )
  }
}

// PUT /api/pmb/[id] - Update PMB applicant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name, email, phone, address, birthDate, birthPlace, gender, religion,
      nationality, program, education, school, yearGraduated, parentName,
      parentPhone, parentJob, status, testScore, interviewScore, finalScore, notes
    } = body

    // Cek apakah applicant ada
    const existingApplicant = await prisma.pMBApplicant.findUnique({
      where: { id }
    })

    if (!existingApplicant) {
      return NextResponse.json(
        { error: 'PMB applicant not found' },
        { status: 404 }
      )
    }

    // Cek apakah email sudah digunakan oleh applicant lain
    if (email && email !== existingApplicant.email) {
      const duplicateEmail = await prisma.pMBApplicant.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh pendaftar lain' },
          { status: 400 }
        )
      }
    }

    // Update applicant
    const updatedApplicant = await prisma.pMBApplicant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(birthPlace && { birthPlace }),
        ...(gender && { gender }),
        ...(religion && { religion }),
        ...(nationality && { nationality }),
        ...(program && { program }),
        ...(education && { education }),
        ...(school && { school }),
        ...(yearGraduated && { yearGraduated: parseInt(yearGraduated) }),
        ...(parentName && { parentName }),
        ...(parentPhone && { parentPhone }),
        ...(parentJob && { parentJob }),
        ...(status && { status }),
        ...(testScore !== undefined && { testScore: testScore ? parseFloat(testScore) : null }),
        ...(interviewScore !== undefined && { interviewScore: interviewScore ? parseFloat(interviewScore) : null }),
        ...(finalScore !== undefined && { finalScore: finalScore ? parseFloat(finalScore) : null }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json(updatedApplicant)

  } catch (error) {
    console.error('Error updating PMB applicant:', error)
    return NextResponse.json(
      { error: 'Failed to update PMB applicant' },
      { status: 500 }
    )
  }
}

// DELETE /api/pmb/[id] - Delete PMB applicant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Cek apakah applicant ada
    const existingApplicant = await prisma.pMBApplicant.findUnique({
      where: { id }
    })

    if (!existingApplicant) {
      return NextResponse.json(
        { error: 'PMB applicant not found' },
        { status: 404 }
      )
    }

    // Hapus applicant
    await prisma.pMBApplicant.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'PMB applicant deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting PMB applicant:', error)
    return NextResponse.json(
      { error: 'Failed to delete PMB applicant' },
      { status: 500 }
    )
  }
}

