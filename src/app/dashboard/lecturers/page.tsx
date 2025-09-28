'use client'

import { useState, useEffect } from 'react'
import { Lecturer } from '@/types'

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null)

  useEffect(() => {
    fetchLecturers()
  }, [])

  const fetchLecturers = async () => {
    try {
      const response = await fetch('/api/lecturers')
      if (response.ok) {
        const data = await response.json()
        setLecturers(data)
      }
    } catch (error) {
      console.error('Error fetching lecturers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data dosen ini?')) return

    try {
      const response = await fetch(`/api/lecturers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLecturers(lecturers.filter(lecturer => lecturer.id !== id))
        alert('Data dosen berhasil dihapus')
      } else {
        alert('Gagal menghapus data dosen')
      }
    } catch (error) {
      console.error('Error deleting lecturer:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleSyncPDDIKTI = async (nidn: string) => {
    try {
      const response = await fetch(`/api/pddikti/sync/lecturer?nidn=${nidn}`)
      const data = await response.json()

      if (data.success) {
        alert('Data berhasil disinkronisasi dari PDDIKTI')
        fetchLecturers() // Refresh data
      } else {
        alert('Data tidak ditemukan di PDDIKTI')
      }
    } catch (error) {
      console.error('Error syncing with PDDIKTI:', error)
      alert('Terjadi kesalahan saat sinkronisasi')
    }
  }

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.nidn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.position.toLowerCase().includes(searchTerm.toLowerCase())
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
                Manajemen Dosen
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola data dosen STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah Dosen
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
                placeholder="Cari berdasarkan nama, NIDN, departemen, atau jabatan..."
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
                  const csv = lecturers.map(l => `${l.nidn},${l.name},${l.position},${l.department}`).join('\n')
                  const blob = new Blob([`NIDN,Nama,Jabatan,Departemen\n${csv}`], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'data-dosen.csv'
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
            <div className="text-2xl font-bold text-blue-600">{lecturers.length}</div>
            <div className="text-sm text-gray-500">Total Dosen</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {lecturers.filter(l => l.position.includes('Prof')).length}
            </div>
            <div className="text-sm text-gray-500">Profesor</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {lecturers.filter(l => l.position.includes('Doktor')).length}
            </div>
            <div className="text-sm text-gray-500">Doktor</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(lecturers.map(l => l.department)).size}
            </div>
            <div className="text-sm text-gray-500">Departemen</div>
          </div>
        </div>

        {/* Lecturers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar Dosen ({filteredLecturers.length} dari {lecturers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIDN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departemen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lecturer.nidn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingLecturer(lecturer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSyncPDDIKTI(lecturer.nidn)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Sync PDDIKTI
                      </button>
                      <button
                        onClick={() => handleDelete(lecturer.id)}
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

          {filteredLecturers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? 'Tidak ada dosen yang sesuai dengan pencarian' : 'Belum ada data dosen'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Lecturer Modal */}
      {(showAddForm || editingLecturer) && (
        <LecturerFormModal
          lecturer={editingLecturer}
          onClose={() => {
            setShowAddForm(false)
            setEditingLecturer(null)
          }}
          onSave={() => {
            fetchLecturers()
            setShowAddForm(false)
            setEditingLecturer(null)
          }}
        />
      )}
    </div>
  )
}

// Lecturer Form Modal Component
function LecturerFormModal({ lecturer, onClose, onSave }: {
  lecturer: Lecturer | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    nidn: lecturer?.nidn || '',
    name: lecturer?.name || '',
    email: lecturer?.email || '',
    phone: lecturer?.phone || '',
    position: lecturer?.position || '',
    department: lecturer?.department || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = lecturer ? `/api/lecturers/${lecturer.id}` : '/api/lecturers'
      const method = lecturer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(lecturer ? 'Data dosen berhasil diperbarui' : 'Data dosen berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving lecturer:', error)
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
            {lecturer ? 'Edit Dosen' : 'Tambah Dosen Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">NIDN</label>
              <input
                type="text"
                required
                value={formData.nidn}
                onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jabatan Akademik</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Jabatan</option>
                <option value="Profesor">Profesor</option>
                <option value="Doktor">Doktor</option>
                <option value="Magister">Magister</option>
                <option value="Sarjana">Sarjana</option>
                <option value="Asisten Ahli">Asisten Ahli</option>
                <option value="Lektor">Lektor</option>
                <option value="Lektor Kepala">Lektor Kepala</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Departemen</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                {loading ? 'Menyimpan...' : (lecturer ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
