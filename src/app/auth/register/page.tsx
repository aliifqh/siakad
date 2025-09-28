'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterRequest } from '@/types'

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    role: 'STUDENT',
    studentData: {
      nim: '',
      name: '',
      program: '',
      semester: 1
    },
    lecturerData: {
      nidn: '',
      name: '',
      position: '',
      department: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Simpan token ke localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirect ke dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registrasi gagal')
      }
    } catch {
      setError('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('studentData.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        studentData: {
          ...formData.studentData!,
          [field]: field === 'semester' ? parseInt(value) : value
        }
      })
    } else if (name.startsWith('lecturerData.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        lecturerData: {
          ...formData.lecturerData!,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar Akun SIAKAD
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Buat akun baru untuk mengakses SIAKAD STIM Surakarta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email dan Password */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Mahasiswa</option>
                <option value="LECTURER">Dosen</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Data Mahasiswa */}
            {formData.role === 'STUDENT' && (
              <>
                <div>
                  <label htmlFor="studentData.nim" className="block text-sm font-medium text-gray-700">
                    NIM
                  </label>
                  <input
                    id="studentData.nim"
                    name="studentData.nim"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.studentData?.nim || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="studentData.name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    id="studentData.name"
                    name="studentData.name"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.studentData?.name || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="studentData.program" className="block text-sm font-medium text-gray-700">
                    Program Studi
                  </label>
                  <input
                    id="studentData.program"
                    name="studentData.program"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.studentData?.program || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="studentData.semester" className="block text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <input
                    id="studentData.semester"
                    name="studentData.semester"
                    type="number"
                    min="1"
                    max="14"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.studentData?.semester || 1}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Data Dosen */}
            {formData.role === 'LECTURER' && (
              <>
                <div>
                  <label htmlFor="lecturerData.nidn" className="block text-sm font-medium text-gray-700">
                    NIDN
                  </label>
                  <input
                    id="lecturerData.nidn"
                    name="lecturerData.nidn"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.lecturerData?.nidn || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="lecturerData.name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    id="lecturerData.name"
                    name="lecturerData.name"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.lecturerData?.name || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="lecturerData.position" className="block text-sm font-medium text-gray-700">
                    Jabatan Akademik
                  </label>
                  <input
                    id="lecturerData.position"
                    name="lecturerData.position"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.lecturerData?.position || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="lecturerData.department" className="block text-sm font-medium text-gray-700">
                    Departemen
                  </label>
                  <input
                    id="lecturerData.department"
                    name="lecturerData.department"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.lecturerData?.department || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sudah punya akun? Masuk di sini
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
