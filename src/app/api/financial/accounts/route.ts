import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/financial/accounts - Get all financial accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}

    if (search) {
      whereClause.student = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nim: { contains: search, mode: 'insensitive' } },
          { program: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    const accounts = await prisma.financialAccount.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            nim: true,
            program: true,
            semester: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 transactions
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(accounts)

  } catch (error) {
    console.error('Error fetching financial accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial accounts' },
      { status: 500 }
    )
  }
}

// POST /api/financial/accounts - Create new financial account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId } = body

    // Validasi input
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah student ada
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student tidak ditemukan' },
        { status: 400 }
      )
    }

    // Cek apakah account sudah ada
    const existingAccount = await prisma.financialAccount.findUnique({
      where: { studentId }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account sudah ada untuk mahasiswa ini' },
        { status: 400 }
      )
    }

    // Buat account
    const account = await prisma.financialAccount.create({
      data: {
        studentId,
        balance: 0,
        totalDebt: 0,
        totalPaid: 0
      },
      include: {
        student: {
          select: {
            name: true,
            nim: true,
            program: true
          }
        }
      }
    })

    return NextResponse.json(account, { status: 201 })

  } catch (error) {
    console.error('Error creating financial account:', error)
    return NextResponse.json(
      { error: 'Failed to create financial account' },
      { status: 500 }
    )
  }
}
