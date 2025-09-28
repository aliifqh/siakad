import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/financial/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const accountId = searchParams.get('accountId')

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { account: { student: { name: { contains: search, mode: 'insensitive' } } } },
        { account: { student: { nim: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (type) {
      whereClause.type = type
    }

    if (accountId) {
      whereClause.accountId = accountId
    }

    const transactions = await prisma.financialTransaction.findMany({
      where: whereClause,
      include: {
        account: {
          include: {
            student: {
              select: {
                name: true,
                nim: true,
                program: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/financial/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      accountId, type, category, amount, description, status = 'PENDING',
      dueDate, paymentMethod, paymentReference, notes
    } = body

    // Validasi input
    if (!accountId || !type || !category || !amount) {
      return NextResponse.json(
        { error: 'Account, tipe, kategori, dan jumlah harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah account ada
    const account = await prisma.financialAccount.findUnique({
      where: { id: accountId },
      include: { student: true }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account tidak ditemukan' },
        { status: 400 }
      )
    }

    // Buat transaction
    const transaction = await prisma.financialTransaction.create({
      data: {
        accountId,
        type,
        category,
        amount: parseFloat(amount),
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentMethod,
        paymentReference,
        notes
      },
      include: {
        account: {
          include: {
            student: {
              select: {
                name: true,
                nim: true,
                program: true
              }
            }
          }
        }
      }
    })

    // Update account balance
    await updateAccountBalance(accountId)

    return NextResponse.json(transaction, { status: 201 })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

// Helper function to update account balance
async function updateAccountBalance(accountId: string) {
  const transactions = await prisma.financialTransaction.findMany({
    where: { accountId }
  })

  const totalDebt = transactions
    .filter(t => t.type === 'DEBIT' && t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPaid = transactions
    .filter(t => t.type === 'CREDIT' && t.status === 'PAID')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalPaid - totalDebt

  await prisma.financialAccount.update({
    where: { id: accountId },
    data: {
      balance,
      totalDebt,
      totalPaid
    }
  })
}
