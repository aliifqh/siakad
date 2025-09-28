'use client'

import { useState, useEffect } from 'react'
import { KRS, Course, Student } from '@/types'

export default function KRSPage() {
  const [krsList, setKrsList] = useState<KRS[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingKRS, setEditingKRS] = useState<KRS | null>(null)
  const [currentSemester, setCurrentSemester] = useState('2024/2025-Ganjil')
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    fetchKRS()
    fetchCourses()
    fetchStudents()
  }, [])

  const fetchKRS = async () => {
    try {
      const response = await fetch('/api/krs')
      if (response.ok) {
        const data = await response.json()
        setKrsList(data)
      }
    } catch (error) {
      console.error('Error fetching KRS:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus KRS ini?')) return

    try {
      const response = await fetch(`/api/krs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setKrsList(krsList.filter(krs => krs.id !== id))
        alert('KRS berhasil dihapus')
      } else {
        alert('Gagal menghapus KRS')
      }
    } catch (error) {
      console.error('Error deleting KRS:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/krs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        setKrsList(krsList.map(krs => 
          krs.id === id ? { ...krs, status: 'APPROVED' } : krs
        ))
        alert('KRS berhasil disetujui')
      } else {
        alert('Gagal menyetujui KRS')
      }
    } catch (error) {
      console.error('Error approving KRS:', error)
      alert('Terjadi kesalahan saat menyetujui KRS')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/krs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        setKrsList(krsList.map(krs => 
          krs.id === id ? { ...krs, status: 'REJECTED' } : krs
        ))
        alert('KRS berhasil ditolak')
      } else {
        alert('Gagal menolak KRS')
      }
    } catch (error) {
      console.error('Error rejecting KRS:', error)
      alert('Terjadi kesalahan saat menolak KRS')
    }
  }

  const filteredKRS = krsList.filter(krs =>
    krs.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    krs.student?.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    krs.course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    krs.course?.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
                Kartu Rencana Studi (KRS)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola KRS mahasiswa STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah KRS
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
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari berdasarkan nama mahasiswa, NIM, atau mata kuliah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024/2025-Ganjil">2024/2025 - Ganjil</option>
                <option value="2024/2025-Genap">2024/2025 - Genap</option>
                <option value="2025/2026-Ganjil">2025/2026 - Ganjil</option>
                <option value="2025/2026-Genap">2025/2026 - Genap</option>
              </select>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{krsList.length}</div>
            <div className="text-sm text-gray-500">Total KRS</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {krsList.filter(k => k.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-500">KRS Disetujui</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {krsList.filter(k => k.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500">KRS Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {krsList.filter(k => k.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-500">KRS Ditolak</div>
          </div>
        </div>

        {/* KRS Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar KRS ({filteredKRS.length} dari {krsList.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tahun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKRS.map((krs) => (
                  <tr key={krs.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{krs.student?.name}</div>
                        <div className="text-gray-500">{krs.student?.nim}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{krs.course?.name}</div>
                        <div className="text-gray-500">{krs.course?.code} - {krs.course?.credits} SKS</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {krs.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {krs.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        krs.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800'
                          : krs.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {krs.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {krs.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(krs.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(krs.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingKRS(krs)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(krs.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredKRS.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? 'Tidak ada KRS yang sesuai dengan pencarian' : 'Belum ada data KRS'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit KRS Modal */}
      {(showAddForm || editingKRS) && (
        <KRSFormModal
          krs={editingKRS}
          courses={courses}
          students={students}
          currentSemester={currentSemester}
          currentYear={currentYear}
          onClose={() => {
            setShowAddForm(false)
            setEditingKRS(null)
          }}
          onSave={() => {
            fetchKRS()
            setShowAddForm(false)
            setEditingKRS(null)
          }}
        />
      )}
    </div>
  )
}

// KRS Form Modal Component
function KRSFormModal({ krs, courses, students, currentSemester, currentYear, onClose, onSave }: {
  krs: KRS | null
  courses: Course[]
  students: Student[]
  currentSemester: string
  currentYear: number
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: krs?.studentId || '',
    courseId: krs?.courseId || '',
    semester: krs?.semester || currentSemester,
    year: krs?.year || currentYear,
    status: krs?.status || 'PENDING'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = krs ? `/api/krs/${krs.id}` : '/api/krs'
      const method = krs ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(krs ? 'KRS berhasil diperbarui' : 'KRS berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving KRS:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {krs ? 'Edit KRS' : 'Tambah KRS Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mahasiswa</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Mahasiswa</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.nim} ({student.program})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mata Kuliah</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Mata Kuliah</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name} ({course.credits} SKS)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tahun</label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : (krs ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

