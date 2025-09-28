'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import PDDIKTIWidget from '@/components/PDDIKTIWidget'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPDDIKTI, setShowPDDIKTI] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                SIAKAD STIM Surakarta
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Selamat datang, {user.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
              <button
                onClick={() => setShowPDDIKTI(!showPDDIKTI)}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                {showPDDIKTI ? 'Sembunyikan' : 'Tampilkan'} PDDIKTI
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PDDIKTI Widget */}
        {showPDDIKTI && (
          <div className="mb-8">
            <PDDIKTIWidget />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards berdasarkan role */}
          {user.role === 'ADMIN' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">S</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Manajemen Mahasiswa
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola data mahasiswa
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/students" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">D</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Manajemen Dosen
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola data dosen
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/lecturers" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">M</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Manajemen Mata Kuliah
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola mata kuliah
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/courses" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">K</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Manajemen KRS
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola KRS mahasiswa
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/krs" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">P</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Penerimaan Mahasiswa Baru
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola PMB
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/pmb" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">$</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Manajemen Keuangan
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola transaksi keuangan
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/financial" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Analytics & Reporting
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Laporan dan analisis data
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/analytics" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">R</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Ruangan & Jadwal
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola ruangan dan jadwal kuliah
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/rooms" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'STUDENT' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">K</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Kartu Rencana Studi
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Input KRS
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/krs" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">N</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Nilai Akademik
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Lihat nilai
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/grades" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'LECTURER' && (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">M</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Mata Kuliah Saya
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Kelola mata kuliah
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/my-courses" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">N</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Input Nilai
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          Berikan nilai mahasiswa
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/dashboard/grading" className="font-medium text-blue-600 hover:text-blue-500">
                      Lihat detail
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistik Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-500">Total Mahasiswa</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-500">Total Dosen</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-500">Mata Kuliah</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-sm text-gray-500">KRS Aktif</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
