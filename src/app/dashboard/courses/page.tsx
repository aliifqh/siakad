'use client'

import { useState, useEffect } from 'react'
import { Course, Lecturer } from '@/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
    fetchLecturers()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLecturers = async () => {
    try {
      const response = await fetch('/api/lecturers')
      if (response.ok) {
        const data = await response.json()
        setLecturers(data)
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) return

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== id))
        alert('Mata kuliah berhasil dihapus')
      } else {
        alert('Gagal menghapus mata kuliah')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.lecturer?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                Manajemen Mata Kuliah
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola mata kuliah STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah Mata Kuliah
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
                placeholder="Cari berdasarkan nama, kode, deskripsi, atau dosen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Cetak
              </button>
              <button
                onClick={() => {
                  const csv = courses.map(c => `${c.code},${c.name},${c.credits},${c.semester},${c.lecturer?.name || ''}`).join('\n')
                  const blob = new Blob([`Kode,Nama,SKS,Semester,Dosen\n${csv}`], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'data-mata-kuliah.csv'
                  a.click()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-sm text-gray-500">Total Mata Kuliah</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </div>
            <div className="text-sm text-gray-500">Total SKS</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(courses.map(c => c.semester)).size}
            </div>
            <div className="text-sm text-gray-500">Semester Aktif</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(courses.map(c => c.lecturerId)).size}
            </div>
            <div className="text-sm text-gray-500">Dosen Pengajar</div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar Mata Kuliah ({filteredCourses.length} dari {courses.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Mata Kuliah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        {course.description && (
                          <div className="text-gray-500 text-xs mt-1">
                            {course.description.length > 50 
                              ? `${course.description.substring(0, 50)}...` 
                              : course.description
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.lecturer?.name || 'Belum ditentukan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? 'Tidak ada mata kuliah yang sesuai dengan pencarian' : 'Belum ada data mata kuliah'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Course Modal */}
      {(showAddForm || editingCourse) && (
        <CourseFormModal
          course={editingCourse}
          lecturers={lecturers}
          onClose={() => {
            setShowAddForm(false)
            setEditingCourse(null)
          }}
          onSave={() => {
            fetchCourses()
            setShowAddForm(false)
            setEditingCourse(null)
          }}
        />
      )}
    </div>
  )
}

// Course Form Modal Component
function CourseFormModal({ course, lecturers, onClose, onSave }: {
  course: Course | null
  lecturers: Lecturer[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    code: course?.code || '',
    name: course?.name || '',
    credits: course?.credits || 1,
    semester: course?.semester || 1,
    description: course?.description || '',
    lecturerId: course?.lecturerId || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = course ? `/api/courses/${course.id}` : '/api/courses'
      const method = course ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(course ? 'Mata kuliah berhasil diperbarui' : 'Mata kuliah berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving course:', error)
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
            {course ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kode Mata Kuliah</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Mata Kuliah</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SKS</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <input
                type="number"
                min="1"
                max="14"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dosen Pengajar</label>
              <select
                value={formData.lecturerId}
                onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Dosen</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} - {lecturer.position}
                  </option>
                ))}
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
                {loading ? 'Menyimpan...' : (course ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
