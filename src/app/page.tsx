'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        JSON.parse(userData) // Validate user data
        // Jika sudah login, redirect ke dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#374151] to-[#6B7280] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-[#6B7280]/20 to-[#111827]/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#6B7280]/20 to-[#111827]/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#111827]/20 to-[#6B7280]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#6B7280]/10 to-[#111827]/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      {/* Glassmorphism Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#2A6061] to-[#70CACB] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                SIAKAD STIM Surakarta
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/auth/login"
                className="backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 border border-white/30 hover:border-white/50 hover:shadow-lg"
              >
                Masuk
              </a>
              <a
                href="/auth/register"
                className="backdrop-blur-sm bg-gradient-to-r from-[#2A6061]/20 to-[#70CACB]/20 hover:from-[#2A6061]/30 hover:to-[#70CACB]/30 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105 hover:shadow-xl"
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Sistem Informasi Akademik
              <span className="block bg-gradient-to-r from-[#2A6061] to-[#70CACB] bg-clip-text text-transparent">
                STIM Surakarta
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed">
              Platform terintegrasi dengan teknologi modern untuk mengelola data akademik, 
              keuangan, dan administrasi mahasiswa dengan pengalaman pengguna yang luar biasa.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/auth/login"
                className="backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105 hover:shadow-lg"
              >
                Masuk ke Sistem
              </a>
              <a
                href="/auth/register"
                className="backdrop-blur-sm bg-gradient-to-r from-[#2A6061]/20 to-[#70CACB]/20 hover:from-[#2A6061]/30 hover:to-[#70CACB]/30 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105 hover:shadow-xl"
              >
                Daftar Akun Baru
              </a>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { number: '5000+', label: 'Mahasiswa Aktif' },
            { number: '150+', label: 'Dosen Berpengalaman' },
            { number: '50+', label: 'Program Studi' },
            { number: '99.9%', label: 'Uptime Sistem' }
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-md bg-gradient-to-br from-[#2A6061]/10 to-[#70CACB]/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Manajemen Mahasiswa',
                description: 'Kelola data mahasiswa, status akademik, dan informasi personal dengan mudah dan aman.',
                gradient: 'from-[#2A6061]/20 to-[#70CACB]/20',
                iconBg: 'from-[#2A6061] to-[#70CACB]'
              },
              {
                title: 'Kartu Rencana Studi',
                description: 'Sistem KRS online yang memudahkan mahasiswa dalam memilih mata kuliah dan dosen.',
                gradient: 'from-[#70CACB]/20 to-[#2A6061]/20',
                iconBg: 'from-[#70CACB] to-[#2A6061]'
              },
              {
                title: 'Laporan Akademik',
                description: 'Generate laporan akademik, transkrip nilai, dan sertifikat dengan format profesional.',
                gradient: 'from-[#2A6061]/20 to-[#70CACB]/20',
                iconBg: 'from-[#2A6061] to-[#70CACB]'
              },
              {
                title: 'Manajemen Keuangan',
                description: 'Kelola pembayaran SPP, biaya kuliah, dan transaksi keuangan mahasiswa secara terintegrasi.',
                gradient: 'from-[#70CACB]/20 to-[#2A6061]/20',
                iconBg: 'from-[#70CACB] to-[#2A6061]'
              },
              {
                title: 'Analytics & Reporting',
                description: 'Dashboard analitik untuk monitoring performa akademik dan statistik keuangan.',
                gradient: 'from-[#2A6061]/20 to-[#70CACB]/20',
                iconBg: 'from-[#2A6061] to-[#70CACB]'
              },
              {
                title: 'Jadwal & Ruangan',
                description: 'Manajemen jadwal kuliah dan alokasi ruangan dengan sistem yang efisien.',
                gradient: 'from-[#70CACB]/20 to-[#2A6061]/20',
                iconBg: 'from-[#70CACB] to-[#2A6061]'
              }
            ].map((feature, index) => (
              <div key={index} className={`backdrop-blur-md bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group`}>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Teknologi Modern
          </h2>
          <div className="backdrop-blur-md bg-gradient-to-br from-[#2A6061]/10 to-[#70CACB]/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Next.js 14', desc: 'React Framework' },
                { name: 'TypeScript', desc: 'Type Safety' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'Prisma ORM', desc: 'Database' }
              ].map((tech, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-10 h-10 bg-white/30 rounded-lg"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{tech.name}</h3>
                  <p className="text-white/70">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24">
          <div className="backdrop-blur-md bg-gradient-to-r from-[#2A6061]/20 to-[#70CACB]/20 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Siap Memulai Perjalanan Akademik?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
                Bergabunglah dengan ribuan mahasiswa yang telah merasakan kemudahan 
                dalam mengelola data akademik mereka dengan teknologi terdepan.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="/auth/register"
                  className="backdrop-blur-sm bg-gradient-to-r from-[#2A6061]/20 to-[#70CACB]/20 hover:from-[#2A6061]/30 hover:to-[#70CACB]/30 text-white px-12 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105 hover:shadow-xl"
                >
                  Daftar Sekarang
                </a>
                <a
                  href="/auth/login"
                  className="backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white px-12 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 transform hover:scale-105 hover:shadow-lg"
                >
                  Masuk ke Akun
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Glassmorphism Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-white/5 border-t border-white/20 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#2A6061] to-[#70CACB] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h3 className="text-2xl font-bold text-white">SIAKAD STIM</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Sistem Informasi Akademik terintegrasi dengan teknologi modern untuk kemudahan 
                manajemen data mahasiswa dan administrasi kampus yang efisien.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                  <span className="text-white/80">info@stim.ac.id</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                  <span className="text-white/80">(0271) 123-456</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                  <span className="text-white/80">Jl. Contoh No. 123, Surakarta</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Link Cepat</h3>
              <div className="space-y-3">
                <a href="/auth/login" className="block text-white/80 hover:text-white transition-colors text-lg">
                  Masuk
                </a>
                <a href="/auth/register" className="block text-white/80 hover:text-white transition-colors text-lg">
                  Daftar
                </a>
                <a href="/dashboard" className="block text-white/80 hover:text-white transition-colors text-lg">
                  Dashboard
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/60">
              &copy; 2024 SIAKAD STIM Surakarta. All rights reserved. Made with modern technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}