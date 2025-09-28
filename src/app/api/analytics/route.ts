import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = parseInt(searchParams.get('range') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - range)

    // Students analytics
    const students = await prisma.student.findMany({
      include: {
        user: true
      }
    })

    const studentsByProgram = await prisma.student.groupBy({
      by: ['program'],
      _count: {
        id: true
      }
    })

    const studentsBySemester = await prisma.student.groupBy({
      by: ['semester'],
      _count: {
        id: true
      }
    })

    // Lecturers analytics
    const lecturers = await prisma.lecturer.findMany({
      include: {
        user: true
      }
    })

    const lecturersByPosition = await prisma.lecturer.groupBy({
      by: ['position'],
      _count: {
        id: true
      }
    })

    const lecturersByDepartment = await prisma.lecturer.groupBy({
      by: ['department'],
      _count: {
        id: true
      }
    })

    // Courses analytics
    const courses = await prisma.course.findMany()
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

    const coursesBySemester = await prisma.course.groupBy({
      by: ['semester'],
      _count: {
        id: true
      }
    })

    // KRS analytics
    const krsStats = await prisma.kRS.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Financial analytics
    const financialTransactions = await prisma.financialTransaction.findMany()
    const totalDebt = financialTransactions
      .filter(t => t.type === 'DEBIT' && t.status !== 'CANCELLED')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalPaid = financialTransactions
      .filter(t => t.type === 'CREDIT' && t.status === 'PAID')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingAmount = financialTransactions
      .filter(t => t.status === 'PENDING' && t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const overdueAmount = financialTransactions
      .filter(t => t.status === 'OVERDUE')
      .reduce((sum, t) => sum + t.amount, 0)

    // PMB analytics
    const pmbStats = await prisma.pMBApplicant.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const analyticsData = {
      students: {
        total: students.length,
        active: students.filter(s => s.user?.isActive).length,
        graduated: students.filter(s => s.semester >= 8).length,
        byProgram: studentsByProgram.map(item => ({
          program: item.program,
          count: item._count.id
        })),
        bySemester: studentsBySemester.map(item => ({
          semester: item.semester,
          count: item._count.id
        }))
      },
      lecturers: {
        total: lecturers.length,
        byPosition: lecturersByPosition.map(item => ({
          position: item.position,
          count: item._count.id
        })),
        byDepartment: lecturersByDepartment.map(item => ({
          department: item.department,
          count: item._count.id
        }))
      },
      courses: {
        total: courses.length,
        totalCredits,
        bySemester: coursesBySemester.map(item => ({
          semester: item.semester,
          count: item._count.id
        }))
      },
      krs: {
        total: krsStats.reduce((sum, item) => sum + item._count.id, 0),
        approved: krsStats.find(item => item.status === 'APPROVED')?._count.id || 0,
        pending: krsStats.find(item => item.status === 'PENDING')?._count.id || 0,
        rejected: krsStats.find(item => item.status === 'REJECTED')?._count.id || 0
      },
      financial: {
        totalDebt,
        totalPaid,
        pendingAmount,
        overdueAmount
      },
      pmb: {
        totalApplicants: pmbStats.reduce((sum, item) => sum + item._count.id, 0),
        accepted: pmbStats.find(item => item.status === 'ACCEPTED')?._count.id || 0,
        rejected: pmbStats.find(item => item.status === 'REJECTED')?._count.id || 0,
        enrolled: pmbStats.find(item => item.status === 'ENROLLED')?._count.id || 0
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
