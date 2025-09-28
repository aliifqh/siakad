'use client'

import { useState, useEffect } from 'react'

interface PMBApplicant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  birthPlace: string
  gender: string
  religion: string
  nationality: string
  program: string
  education: string
  school: string
  yearGraduated: number
  parentName: string
  parentPhone: string
  parentJob: string
  status: string
  registrationDate: string
  testScore?: number
  interviewScore?: number
  finalScore?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function PMBPage() {
  const [applicants, setApplicants] = useState<PMBApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingApplicant, setEditingApplicant] = useState<PMBApplicant | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const response = await fetch('/api/pmb')
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      }
    } catch (error) {
      console.error('Error fetching PMB applicants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pendaftar ini?')) return

    try {
      const response = await fetch(`/api/pmb/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApplicants(applicants.filter(applicant => applicant.id !== id))
        alert('Data pendaftar berhasil dihapus')
      } else {
        alert('Gagal menghapus data pendaftar')
      }
    } catch (error) {
      console.error('Error deleting applicant:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/pmb/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setApplicants(applicants.map(applicant => 
          applicant.id === id ? { ...applicant, status: newStatus } : applicant
        ))
        alert('Status berhasil diperbarui')
      } else {
        alert('Gagal memperbarui status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Terjadi kesalahan saat memperbarui status')
    }
  }

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.school.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(applicant => 
    statusFilter ? applicant.status === statusFilter : true
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
                Penerimaan Mahasiswa Baru (PMB)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola pendaftaran mahasiswa baru STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah Pendaftar
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
                placeholder="Cari berdasarkan nama, email, program, atau sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="REGISTERED">Terdaftar</option>
                <option value="TEST_SCHEDULED">Tes Terjadwal</option>
                <option value="TEST_COMPLETED">Tes Selesai</option>
                <option value="INTERVIEW_SCHEDULED">Wawancara Terjadwal</option>
                <option value="INTERVIEW_COMPLETED">Wawancara Selesai</option>
                <option value="ACCEPTED">Diterima</option>
                <option value="REJECTED">Ditolak</option>
                <option value="ENROLLED">Terdaftar Ulang</option>
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
            <div className="text-2xl font-bold text-blue-600">{applicants.length}</div>
            <div className="text-sm text-gray-500">Total Pendaftar</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {applicants.filter(a => a.status === 'ACCEPTED').length}
            </div>
            <div className="text-sm text-gray-500">Diterima</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {applicants.filter(a => ['TEST_SCHEDULED', 'TEST_COMPLETED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(a.status)).length}
            </div>
            <div className="text-sm text-gray-500">Dalam Proses</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {applicants.filter(a => a.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-500">Ditolak</div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar Pendaftar ({filteredApplicants.length} dari {applicants.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sekolah Asal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Daftar
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
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-gray-500">{applicant.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {applicant.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{applicant.school}</div>
                        <div className="text-gray-500">Lulus: {applicant.yearGraduated}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(applicant.registrationDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        applicant.status === 'ACCEPTED' 
                          ? 'bg-green-100 text-green-800'
                          : applicant.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : applicant.status === 'ENROLLED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicant.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingApplicant(applicant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="REGISTERED">Terdaftar</option>
                        <option value="TEST_SCHEDULED">Tes Terjadwal</option>
                        <option value="TEST_COMPLETED">Tes Selesai</option>
                        <option value="INTERVIEW_SCHEDULED">Wawancara Terjadwal</option>
                        <option value="INTERVIEW_COMPLETED">Wawancara Selesai</option>
                        <option value="ACCEPTED">Diterima</option>
                        <option value="REJECTED">Ditolak</option>
                        <option value="ENROLLED">Terdaftar Ulang</option>
                      </select>
                      <button
                        onClick={() => handleDelete(applicant.id)}
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

          {filteredApplicants.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || statusFilter ? 'Tidak ada pendaftar yang sesuai dengan filter' : 'Belum ada data pendaftar'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Applicant Modal */}
      {(showAddForm || editingApplicant) && (
        <PMBFormModal
          applicant={editingApplicant}
          onClose={() => {
            setShowAddForm(false)
            setEditingApplicant(null)
          }}
          onSave={() => {
            fetchApplicants()
            setShowAddForm(false)
            setEditingApplicant(null)
          }}
        />
      )}
    </div>
  )
}

// PMB Form Modal Component
function PMBFormModal({ applicant, onClose, onSave }: {
  applicant: PMBApplicant | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: applicant?.name || '',
    email: applicant?.email || '',
    phone: applicant?.phone || '',
    address: applicant?.address || '',
    birthDate: applicant?.birthDate || '',
    birthPlace: applicant?.birthPlace || '',
    gender: applicant?.gender || '',
    religion: applicant?.religion || '',
    nationality: applicant?.nationality || 'Indonesia',
    program: applicant?.program || '',
    education: applicant?.education || '',
    school: applicant?.school || '',
    yearGraduated: applicant?.yearGraduated || new Date().getFullYear(),
    parentName: applicant?.parentName || '',
    parentPhone: applicant?.parentPhone || '',
    parentJob: applicant?.parentJob || '',
    status: applicant?.status || 'REGISTERED',
    testScore: applicant?.testScore || '',
    interviewScore: applicant?.interviewScore || '',
    finalScore: applicant?.finalScore || '',
    notes: applicant?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = applicant ? `/api/pmb/${applicant.id}` : '/api/pmb'
      const method = applicant ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          yearGraduated: parseInt(formData.yearGraduated.toString()),
          testScore: formData.testScore ? parseFloat(formData.testScore.toString()) : null,
          interviewScore: formData.interviewScore ? parseFloat(formData.interviewScore.toString()) : null,
          finalScore: formData.finalScore ? parseFloat(formData.finalScore.toString()) : null
        }),
      })

      if (response.ok) {
        alert(applicant ? 'Data pendaftar berhasil diperbarui' : 'Data pendaftar berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving applicant:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {applicant ? 'Detail Pendaftar' : 'Tambah Pendaftar Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                <input
                  type="text"
                  required
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Program Studi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Manajemen">Manajemen</option>
                  <option value="Akuntansi">Akuntansi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                  <option value="MA">MA</option>
                  <option value="Paket C">Paket C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sekolah Asal</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tahun Lulus</label>
                <input
                  type="number"
                  min="2010"
                  max={new Date().getFullYear()}
                  required
                  value={formData.yearGraduated}
                  onChange={(e) => setFormData({ ...formData, yearGraduated: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Orang Tua</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">No. Telepon Orang Tua</label>
                <input
                  type="text"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pekerjaan Orang Tua</label>
                <input
                  type="text"
                  required
                  value={formData.parentJob}
                  onChange={(e) => setFormData({ ...formData, parentJob: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : (applicant ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

