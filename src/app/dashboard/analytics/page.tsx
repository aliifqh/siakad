'use client'

import { useState, useEffect, useCallback } from 'react'

interface AnalyticsData {
  students: {
    total: number
    active: number
    graduated: number
    byProgram: { program: string; count: number }[]
    bySemester: { semester: number; count: number }[]
  }
  lecturers: {
    total: number
    byPosition: { position: string; count: number }[]
    byDepartment: { department: string; count: number }[]
  }
  courses: {
    total: number
    totalCredits: number
    bySemester: { semester: number; count: number }[]
  }
  krs: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  financial: {
    totalDebt: number
    totalPaid: number
    pendingAmount: number
    overdueAmount: number
  }
  pmb: {
    totalApplicants: number
    accepted: number
    rejected: number
    enrolled: number
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [selectedChart, setSelectedChart] = useState('students')

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&range=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        a.click()
      } else {
        alert('Gagal mengexport laporan')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Terjadi kesalahan saat export laporan')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Gagal memuat data analytics</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Analytics & Reporting
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Analisis data dan laporan STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="90">3 Bulan Terakhir</option>
                <option value="365">1 Tahun Terakhir</option>
              </select>
              <button
                onClick={() => exportReport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Export Excel
              </button>
              <a
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{analyticsData.students.total}</div>
                <div className="text-sm text-gray-500">Total Mahasiswa</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">D</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{analyticsData.lecturers.total}</div>
                <div className="text-sm text-gray-500">Total Dosen</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">M</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{analyticsData.courses.total}</div>
                <div className="text-sm text-gray-500">Mata Kuliah</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">K</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{analyticsData.krs.total}</div>
                <div className="text-sm text-gray-500">Total KRS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Selection */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedChart('students')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedChart === 'students' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mahasiswa
            </button>
            <button
              onClick={() => setSelectedChart('lecturers')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedChart === 'lecturers' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dosen
            </button>
            <button
              onClick={() => setSelectedChart('courses')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedChart === 'courses' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mata Kuliah
            </button>
            <button
              onClick={() => setSelectedChart('financial')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedChart === 'financial' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Keuangan
            </button>
            <button
              onClick={() => setSelectedChart('pmb')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedChart === 'pmb' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PMB
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Students Chart */}
          {selectedChart === 'students' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mahasiswa per Program Studi</h3>
                <div className="space-y-3">
                  {analyticsData.students.byProgram.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.program}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / analyticsData.students.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mahasiswa per Semester</h3>
                <div className="space-y-3">
                  {analyticsData.students.bySemester.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Semester {item.semester}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / analyticsData.students.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Lecturers Chart */}
          {selectedChart === 'lecturers' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dosen per Jabatan</h3>
                <div className="space-y-3">
                  {analyticsData.lecturers.byPosition.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.position}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / analyticsData.lecturers.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dosen per Departemen</h3>
                <div className="space-y-3">
                  {analyticsData.lecturers.byDepartment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.department}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / analyticsData.lecturers.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Financial Chart */}
          {selectedChart === 'financial' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Keuangan</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Piutang</span>
                    <span className="text-lg font-bold text-red-600">
                      Rp {analyticsData.financial.totalDebt.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Pembayaran</span>
                    <span className="text-lg font-bold text-green-600">
                      Rp {analyticsData.financial.totalPaid.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-bold text-yellow-600">
                      Rp {analyticsData.financial.pendingAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Jatuh Tempo</span>
                    <span className="text-lg font-bold text-red-600">
                      Rp {analyticsData.financial.overdueAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Pembayaran</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {((analyticsData.financial.totalPaid / analyticsData.financial.totalDebt) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Tingkat Pembayaran</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(analyticsData.financial.totalPaid / analyticsData.financial.totalDebt) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PMB Chart */}
          {selectedChart === 'pmb' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Pendaftar PMB</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Pendaftar</span>
                    <span className="text-lg font-bold text-blue-600">{analyticsData.pmb.totalApplicants}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Diterima</span>
                    <span className="text-lg font-bold text-green-600">{analyticsData.pmb.accepted}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Ditolak</span>
                    <span className="text-lg font-bold text-red-600">{analyticsData.pmb.rejected}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">Terdaftar Ulang</span>
                    <span className="text-lg font-bold text-purple-600">{analyticsData.pmb.enrolled}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tingkat Penerimaan</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {((analyticsData.pmb.accepted / analyticsData.pmb.totalApplicants) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Tingkat Penerimaan</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(analyticsData.pmb.accepted / analyticsData.pmb.totalApplicants) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistik Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.students.active}</div>
              <div className="text-sm text-gray-500">Mahasiswa Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analyticsData.krs.approved}</div>
              <div className="text-sm text-gray-500">KRS Disetujui</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.courses.totalCredits}</div>
              <div className="text-sm text-gray-500">Total SKS</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
