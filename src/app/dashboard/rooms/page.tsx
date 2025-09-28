'use client'

import { useState, useEffect } from 'react'

interface Room {
  id: string
  name: string
  code: string
  capacity: number
  type: 'CLASSROOM' | 'LABORATORY' | 'LIBRARY' | 'AUDITORIUM' | 'MEETING_ROOM' | 'OFFICE'
  location: string
  facilities?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  schedules: Schedule[]
}

interface Schedule {
  id: string
  courseId: string
  lecturerId: string
  roomId: string
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  semester: number
  academicYear: string
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED'
  notes?: string
  createdAt: string
  updatedAt: string
  course: {
    code: string
    name: string
  }
  lecturer: {
    name: string
    nidn: string
  }
  room: {
    name: string
    code: string
  }
}

interface Course {
  id: string
  code: string
  name: string
  credits: number
  semester: number
}

interface Lecturer {
  id: string
  name: string
  nidn: string
  department: string
}

export default function RoomSchedulePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rooms' | 'schedules'>('rooms')
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [roomsRes, schedulesRes, coursesRes, lecturersRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/schedules'),
        fetch('/api/courses'),
        fetch('/api/lecturers')
      ])

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        setRooms(roomsData)
      }

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData)
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (lecturersRes.ok) {
        const lecturersData = await lecturersRes.json()
        setLecturers(lecturersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) return

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== id))
        alert('Ruangan berhasil dihapus')
      } else {
        alert('Gagal menghapus ruangan')
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSchedules(schedules.filter(schedule => schedule.id !== id))
        alert('Jadwal berhasil dihapus')
      } else {
        alert('Gagal menghapus jadwal')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(room => 
    typeFilter ? room.type === typeFilter : true
  )

  const filteredSchedules = schedules.filter(schedule =>
    schedule.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.room.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(schedule => 
    dayFilter ? schedule.day === dayFilter : true
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
                Manajemen Ruangan & Jadwal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola ruangan dan jadwal kuliah STIM Surakarta
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => activeTab === 'rooms' ? setShowRoomForm(true) : setShowScheduleForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Tambah {activeTab === 'rooms' ? 'Ruangan' : 'Jadwal'}
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
        {/* Tabs */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'rooms' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ruangan ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'schedules' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Jadwal ({schedules.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Cari ${activeTab === 'rooms' ? 'ruangan' : 'jadwal'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              {activeTab === 'rooms' ? (
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Tipe</option>
                  <option value="CLASSROOM">Kelas</option>
                  <option value="LABORATORY">Laboratorium</option>
                  <option value="LIBRARY">Perpustakaan</option>
                  <option value="AUDITORIUM">Auditorium</option>
                  <option value="MEETING_ROOM">Ruang Rapat</option>
                  <option value="OFFICE">Kantor</option>
                </select>
              ) : (
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Hari</option>
                  <option value="MONDAY">Senin</option>
                  <option value="TUESDAY">Selasa</option>
                  <option value="WEDNESDAY">Rabu</option>
                  <option value="THURSDAY">Kamis</option>
                  <option value="FRIDAY">Jumat</option>
                  <option value="SATURDAY">Sabtu</option>
                  <option value="SUNDAY">Minggu</option>
                </select>
              )}
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Ruangan ({filteredRooms.length} dari {rooms.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruangan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapasitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jadwal Aktif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-gray-500">{room.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {room.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.capacity} orang
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.schedules.filter(s => s.status === 'ACTIVE').length} jadwal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingRoom(room)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
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

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  {searchTerm || typeFilter ? 'Tidak ada ruangan yang sesuai dengan filter' : 'Belum ada data ruangan'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Jadwal ({filteredSchedules.length} dari {schedules.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Kuliah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruangan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hari
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
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
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{schedule.course.name}</div>
                          <div className="text-gray-500">{schedule.course.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{schedule.lecturer.name}</div>
                          <div className="text-gray-500">{schedule.lecturer.nidn}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{schedule.room.name}</div>
                          <div className="text-gray-500">{schedule.room.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.semester} ({schedule.academicYear})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          schedule.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : schedule.status === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
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

            {filteredSchedules.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  {searchTerm || dayFilter ? 'Tidak ada jadwal yang sesuai dengan filter' : 'Belum ada data jadwal'}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Room Form Modal */}
      {(showRoomForm || editingRoom) && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => {
            setShowRoomForm(false)
            setEditingRoom(null)
          }}
          onSave={() => {
            fetchData()
            setShowRoomForm(false)
            setEditingRoom(null)
          }}
        />
      )}

      {/* Schedule Form Modal */}
      {(showScheduleForm || editingSchedule) && (
        <ScheduleFormModal
          schedule={editingSchedule}
          courses={courses}
          lecturers={lecturers}
          rooms={rooms}
          onClose={() => {
            setShowScheduleForm(false)
            setEditingSchedule(null)
          }}
          onSave={() => {
            fetchData()
            setShowScheduleForm(false)
            setEditingSchedule(null)
          }}
        />
      )}
    </div>
  )
}

// Room Form Modal Component
function RoomFormModal({ room, onClose, onSave }: {
  room: Room | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: room?.name || '',
    code: room?.code || '',
    capacity: room?.capacity || 0,
    type: room?.type || 'CLASSROOM',
    location: room?.location || '',
    facilities: room?.facilities || '',
    isActive: room?.isActive ?? true
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = room ? `/api/rooms/${room.id}` : '/api/rooms'
      const method = room ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(room ? 'Ruangan berhasil diperbarui' : 'Ruangan berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving room:', error)
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
            {room ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Ruangan</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kode Ruangan</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kapasitas</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipe Ruangan</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CLASSROOM' | 'LABORATORY' | 'LIBRARY' | 'AUDITORIUM' | 'MEETING_ROOM' | 'OFFICE' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="CLASSROOM">Kelas</option>
                <option value="LABORATORY">Laboratorium</option>
                <option value="LIBRARY">Perpustakaan</option>
                <option value="AUDITORIUM">Auditorium</option>
                <option value="MEETING_ROOM">Ruang Rapat</option>
                <option value="OFFICE">Kantor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lokasi</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fasilitas</label>
              <textarea
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AC, Proyektor, Papan Tulis, dll"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Ruangan Aktif
              </label>
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
                {loading ? 'Menyimpan...' : (room ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Schedule Form Modal Component
function ScheduleFormModal({ schedule, courses, lecturers, rooms, onClose, onSave }: {
  schedule: Schedule | null
  courses: Course[]
  lecturers: Lecturer[]
  rooms: Room[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    courseId: schedule?.courseId || '',
    lecturerId: schedule?.lecturerId || '',
    roomId: schedule?.roomId || '',
    day: schedule?.day || 'MONDAY',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    semester: schedule?.semester || 1,
    academicYear: schedule?.academicYear || '2024/2025',
    status: schedule?.status || 'ACTIVE',
    notes: schedule?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = schedule ? `/api/schedules/${schedule.id}` : '/api/schedules'
      const method = schedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          semester: parseInt(formData.semester.toString())
        }),
      })

      if (response.ok) {
        alert(schedule ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan')
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
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
            {schedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dosen</label>
              <select
                value={formData.lecturerId}
                onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Dosen</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} - {lecturer.nidn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ruangan</label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Ruangan</option>
                {rooms.filter(room => room.isActive).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.code}) - {room.capacity} orang
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hari</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MONDAY">Senin</option>
                <option value="TUESDAY">Selasa</option>
                <option value="WEDNESDAY">Rabu</option>
                <option value="THURSDAY">Kamis</option>
                <option value="FRIDAY">Jumat</option>
                <option value="SATURDAY">Sabtu</option>
                <option value="SUNDAY">Minggu</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Waktu Mulai</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Waktu Selesai</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tahun Akademik</label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024/2025"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'CANCELLED' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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
                {loading ? 'Menyimpan...' : (schedule ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
