'use client'

import { useState, useEffect } from 'react'
import { PDDIKTIUniversity, PDDIKTIStats } from '@/lib/pddikti'

export default function PDDIKTIWidget() {
  const [stimData, setStimData] = useState<PDDIKTIUniversity | null>(null)
  const [stats, setStats] = useState<PDDIKTIStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPDDIKTIData()
  }, [])

  const fetchPDDIKTIData = async () => {
    try {
      setLoading(true)
      
      // Fetch STIM data dan statistics secara parallel
      const [stimResponse, statsResponse] = await Promise.all([
        fetch('/api/pddikti/stim'),
        fetch('/api/pddikti/statistics')
      ])

      if (stimResponse.ok) {
        const stimResult = await stimResponse.json()
        setStimData(stimResult.data.university)
      }

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        setStats(statsResult.data)
      }

    } catch (error) {
      console.error('Error fetching PDDIKTI data:', error)
      setError('Gagal mengambil data dari PDDIKTI')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-600 text-sm">
          {error}
        </div>
        <button
          onClick={fetchPDDIKTIData}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* STIM Data */}
      {stimData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data STIM dari PDDIKTI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama</label>
              <p className="text-sm text-gray-900">{stimData.nama}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Singkat</label>
              <p className="text-sm text-gray-900">{stimData.nama_singkat}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Alamat</label>
              <p className="text-sm text-gray-900">{stimData.alamat}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kota</label>
              <p className="text-sm text-gray-900">{stimData.kota}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Provinsi</label>
              <p className="text-sm text-gray-900">{stimData.provinsi}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Website</label>
              <a 
                href={stimData.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {stimData.website}
              </a>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Akreditasi</label>
              <p className="text-sm text-gray-900">{stimData.akreditasi}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stimData.status === 'AKTIF' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {stimData.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistik Nasional Pendidikan Tinggi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_universitas?.toLocaleString() || '-'}
              </div>
              <div className="text-sm text-gray-500">Perguruan Tinggi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.total_program_studi?.toLocaleString() || '-'}
              </div>
              <div className="text-sm text-gray-500">Program Studi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.total_dosen?.toLocaleString() || '-'}
              </div>
              <div className="text-sm text-gray-500">Dosen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.total_mahasiswa?.toLocaleString() || '-'}
              </div>
              <div className="text-sm text-gray-500">Mahasiswa</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Widget */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pencarian Data PDDIKTI
        </h3>
        <PDDIKTISearchWidget />
      </div>
    </div>
  )
}

interface SearchResult {
  id: string
  name: string
  type: string
  location?: string
  website?: string
}

function PDDIKTISearchWidget() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/pddikti/search?q=${encodeURIComponent(query)}&type=${type}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(Array.isArray(data.data) ? data.data : [data.data])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Masukkan kata kunci pencarian..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua</option>
          <option value="universitas">Perguruan Tinggi</option>
          <option value="program">Program Studi</option>
          <option value="dosen">Dosen</option>
          <option value="mahasiswa">Mahasiswa</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Hasil Pencarian ({results.length} hasil)
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md">
                <div className="text-sm font-medium text-gray-900">
                  {result.name || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {result.id || 'ID tidak tersedia'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
