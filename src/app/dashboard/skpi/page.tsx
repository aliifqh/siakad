'use client'

import { useState, useEffect } from 'react'

interface SKPI {
  id: string
  studentId: string
  certificateNumber: string
  issueDate: string
  validUntil?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED'
  createdAt: string
  updatedAt: string
  student: {
    name: string
    nim: string
    program: string
  }
  activities: SKPIActivity[]
}

interface SKPIActivity {
  id: string
  skpiId: string
  activityType: 'ACADEMIC' | 'RESEARCH' | 'COMMUNITY_SERVICE' | 'LEADERSHIP' | 'ENTREPRENEURSHIP' | 'INTERNATIONAL' | 'PROFESSIONAL' | 'OTHER'
  title: string
  description?: string
  organizer: string
  location?: string
  startDate: string
  endDate?: string
  position?: string
  certificate?: string
  evidence?: string
  score?: number
  createdAt: string
  updatedAt: string
}

interface Student {
  id: string
  name: string
  nim: string
  program: string
}

export default function SKPIPage() {
  const [skpiList, setSkpiList] = useState<SKPI[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showSKPIForm, setShowSKPIForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [editingSKPI, setEditingSKPI] = useState<SKPI | null>(null)
  const [editingActivity, setEditingActivity] = useState<SKPIActivity | null>(null)
  const [selectedSKPI, setSelectedSKPI] = useState<SKPI | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [skpiRes, studentsRes] = await Promise.all([
        fetch('/api/skpi'),
        fetch('/api/students')
      ])

      if (skpiRes.ok) {
        const skpiData = await skpiRes.json()
        setSkpiList(skpiData)
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSKPI = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus SKPI ini?')) return

    try {
      const response = await fetch(`/api/skpi/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSkpiList(skpiList.filter(skpi => skpi.id !== id))
        alert('SKPI berhasil dihapus')
      } else {
        alert('Gagal menghapus SKPI')
      }
    } catch (error) {
      console.error('Error deleting SKPI:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return

    try {
      const response = await fetch(`/api/skpi/activities/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData() // Refresh data
        alert('Kegiatan berhasil dihapus')
      } else {
        alert('Gagal menghapus kegiatan')
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/skpi/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSkpiList(skpiList.map(skpi => 
          skpi.id === id ? { ...skpi, status: newStatus as any } : skpi
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

  const filteredSKPI = skpiList.filter(skpi =>
    skpi.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skpi.student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skpi.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(skpi => 
    statusFilter ? skpi.status === statusFilter : true
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
                Manajemen SKPI
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Surat Keterangan Pendamping Ijazah STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSKPIForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah SKPI
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
                placeholder="Cari berdasarkan nama mahasiswa, NIM, atau nomor sertifikat..."
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
                <option value="ISSUED">Diterbitkan</option>
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
            <div className="text-2xl font-bold text-blue-600">{skpiList.length}</div>
            <div className="text-sm text-gray-500">Total SKPI</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{skpiList.filter(s => s.status === 'ISSUED').length}</div>
            <div className="text-sm text-gray-500">Diterbitkan</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{skpiList.filter(s => s.status === 'PENDING').length}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{skpiList.filter(s => s.status === 'REJECTED').length}</div>
            <div className="text-sm text-gray-500">Ditolak</div>
          </div>
        </div>

        {/* SKPI Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Daftar SKPI ({filteredSKPI.length} dari {skpiList.length})
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
                    Nomor Sertifikat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Terbit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kegiatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSKPI.map((skpi) => (
                  <tr key={skpi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{skpi.student.name}</div>
                        <div className="text-gray-500">{skpi.student.nim} - {skpi.student.program}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skpi.certificateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(skpi.issueDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        skpi.status === 'ISSUED' 
                          ? 'bg-green-100 text-green-800'
                          : skpi.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : skpi.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {skpi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skpi.activities.length} kegiatan
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedSKPI(skpi)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => setEditingSKPI(skpi)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                      {skpi.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(skpi.id, 'APPROVED')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Setujui
                        </button>
                      )}
                      {skpi.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusChange(skpi.id, 'ISSUED')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Terbitkan
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSKPI(skpi.id)}
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

          {filteredSKPI.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || statusFilter ? 'Tidak ada SKPI yang sesuai dengan filter' : 'Belum ada data SKPI'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SKPI Form Modal */}
      {(showSKPIForm || editingSKPI) && (
        <SKPIFormModal
          skpi={editingSKPI}
          students={students}
          onClose={() => {
            setShowSKPIForm(false)
            setEditingSKPI(null)
          }}
          onSave={() => {
            fetchData()
            setShowSKPIForm(false)
            setEditingSKPI(null)
          }}
        />
      )}

      {/* SKPI Detail Modal */}
      {selectedSKPI && (
        <SKPIDetailModal
          skpi={selectedSKPI}
          onClose={() => setSelectedSKPI(null)}
          onAddActivity={() => {
            setShowActivityForm(true)
            setSelectedSKPI(null)
          }}
          onEditActivity={(activity) => {
            setEditingActivity(activity)
            setSelectedSKPI(null)
          }}
          onDeleteActivity={handleDeleteActivity}
        />
      )}

      {/* Activity Form Modal */}
      {(showActivityForm || editingActivity) && (
        <ActivityFormModal
          activity={editingActivity}
          skpiId={editingActivity?.skpiId || selectedSKPI?.id}
          onClose={() => {
            setShowActivityForm(false)
            setEditingActivity(null)
          }}
          onSave={() => {
            fetchData()
            setShowActivityForm(false)
            setEditingActivity(null)
          }}
        />
      )}
    </div>
  )
}

// SKPI Form Modal Component
function SKPIFormModal({ skpi, students, onClose, onSave }: {
  skpi: SKPI | null
  students: Student[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: skpi?.studentId || '',
    certificateNumber: skpi?.certificateNumber || '',
    issueDate: skpi?.issueDate ? new Date(skpi.issueDate).toISOString().split('T')[0] : '',
    validUntil: skpi?.validUntil ? new Date(skpi.validUntil).toISOString().split('T')[0] : '',
    status: skpi?.status || 'PENDING'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = skpi ? `/api/skpi/${skpi.id}` : '/api/skpi'
      const method = skpi ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          issueDate: new Date(formData.issueDate).toISOString(),
          validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
        }),
      })

      if (response.ok) {
        alert(skpi ? 'SKPI berhasil diperbarui' : 'SKPI berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving SKPI:', error)
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
            {skpi ? 'Edit SKPI' : 'Tambah SKPI Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mahasiswa</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!skpi}
              >
                <option value="">Pilih Mahasiswa</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.nim}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Sertifikat</label>
              <input
                type="text"
                required
                value={formData.certificateNumber}
                onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Terbit</label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Berlaku Sampai</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
                <option value="ISSUED">Diterbitkan</option>
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
                {loading ? 'Menyimpan...' : (skpi ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// SKPI Detail Modal Component
function SKPIDetailModal({ skpi, onClose, onAddActivity, onEditActivity, onDeleteActivity }: {
  skpi: SKPI
  onClose: () => void
  onAddActivity: () => void
  onEditActivity: (activity: SKPIActivity) => void
  onDeleteActivity: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detail SKPI - {skpi.student.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informasi SKPI</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nomor Sertifikat:</span> {skpi.certificateNumber}</div>
                <div><span className="font-medium">Tanggal Terbit:</span> {new Date(skpi.issueDate).toLocaleDateString('id-ID')}</div>
                <div><span className="font-medium">Berlaku Sampai:</span> {skpi.validUntil ? new Date(skpi.validUntil).toLocaleDateString('id-ID') : 'Tidak ada batas waktu'}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    skpi.status === 'ISSUED' 
                      ? 'bg-green-100 text-green-800'
                      : skpi.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800'
                      : skpi.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {skpi.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informasi Mahasiswa</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Nama:</span> {skpi.student.name}</div>
                <div><span className="font-medium">NIM:</span> {skpi.student.nim}</div>
                <div><span className="font-medium">Program:</span> {skpi.student.program}</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">Kegiatan ({skpi.activities.length})</h4>
              <button
                onClick={onAddActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Tambah Kegiatan
              </button>
            </div>
            
            <div className="space-y-4">
              {skpi.activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{activity.title}</h5>
                      <div className="text-sm text-gray-600 mt-1">
                        <div><span className="font-medium">Tipe:</span> {activity.activityType.replace('_', ' ')}</div>
                        <div><span className="font-medium">Organizer:</span> {activity.organizer}</div>
                        <div><span className="font-medium">Tanggal:</span> {new Date(activity.startDate).toLocaleDateString('id-ID')} 
                          {activity.endDate && ` - ${new Date(activity.endDate).toLocaleDateString('id-ID')}`}
                        </div>
                        {activity.location && <div><span className="font-medium">Lokasi:</span> {activity.location}</div>}
                        {activity.position && <div><span className="font-medium">Jabatan:</span> {activity.position}</div>}
                        {activity.score && <div><span className="font-medium">Skor:</span> {activity.score}</div>}
                        {activity.description && <div className="mt-2 text-gray-700">{activity.description}</div>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {skpi.activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada kegiatan yang tercatat
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity Form Modal Component
function ActivityFormModal({ activity, skpiId, onClose, onSave }: {
  activity: SKPIActivity | null
  skpiId?: string
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    skpiId: activity?.skpiId || skpiId || '',
    activityType: activity?.activityType || 'ACADEMIC',
    title: activity?.title || '',
    description: activity?.description || '',
    organizer: activity?.organizer || '',
    location: activity?.location || '',
    startDate: activity?.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
    endDate: activity?.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
    position: activity?.position || '',
    certificate: activity?.certificate || '',
    evidence: activity?.evidence || '',
    score: activity?.score || 0
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = activity ? `/api/skpi/activities/${activity.id}` : '/api/skpi/activities'
      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          score: formData.score ? parseFloat(formData.score.toString()) : null
        }),
      })

      if (response.ok) {
        alert(activity ? 'Kegiatan berhasil diperbarui' : 'Kegiatan berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving activity:', error)
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
            {activity ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipe Kegiatan</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="ACADEMIC">Kegiatan Akademik</option>
                <option value="RESEARCH">Penelitian</option>
                <option value="COMMUNITY_SERVICE">Pengabdian Masyarakat</option>
                <option value="LEADERSHIP">Kepemimpinan</option>
                <option value="ENTREPRENEURSHIP">Kewirausahaan</option>
                <option value="INTERNATIONAL">Internasional</option>
                <option value="PROFESSIONAL">Profesional</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Judul Kegiatan</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Organizer</label>
              <input
                type="text"
                required
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lokasi</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jabatan/Posisi</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Skor/Nilai</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">File Sertifikat</label>
              <input
                type="text"
                value={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL atau nama file"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">File Bukti</label>
              <input
                type="text"
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL atau nama file"
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
                {loading ? 'Menyimpan...' : (activity ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
