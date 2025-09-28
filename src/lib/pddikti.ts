// PDDIKTI API Service
// Menggunakan API wrapper dari ridwaanhall/api-pddikti

const PDDIKTI_BASE_URL = 'https://api-pddikti.ridwaanhall.com'

export interface PDDIKTIUniversity {
  id: string
  nama: string
  nama_singkat: string
  alamat: string
  kota: string
  provinsi: string
  website: string
  logo: string
  akreditasi: string
  status: string
}

export interface PDDIKTIProgram {
  id: string
  nama: string
  jenjang: string
  akreditasi: string
  status: string
  universitas_id: string
}

export interface PDDIKTILecturer {
  id: string
  nama: string
  nidn: string
  nidk: string
  jabatan_fungsional: string
  program_studi_id: string
  universitas_id: string
}

export interface PDDIKTIStudent {
  id: string
  nama: string
  nim: string
  program_studi_id: string
  universitas_id: string
  status: string
}

export interface PDDIKTIStats {
  total_universitas: number
  total_program_studi: number
  total_dosen: number
  total_mahasiswa: number
}

class PDDIKTIService {
  private baseURL: string

  constructor() {
    this.baseURL = PDDIKTI_BASE_URL
  }

  // Search endpoints
  async searchAll(query: string): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to fetch search results')
      return await response.json()
    } catch (error) {
      console.error('Error searching PDDIKTI:', error)
      throw error
    }
  }

  async searchUniversities(query: string): Promise<PDDIKTIUniversity[]> {
    try {
      const response = await fetch(`${this.baseURL}/search/universitas?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to fetch universities')
      return await response.json()
    } catch (error) {
      console.error('Error searching universities:', error)
      throw error
    }
  }

  async searchPrograms(query: string): Promise<PDDIKTIProgram[]> {
    try {
      const response = await fetch(`${this.baseURL}/search/program-studi?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to fetch programs')
      return await response.json()
    } catch (error) {
      console.error('Error searching programs:', error)
      throw error
    }
  }

  async searchLecturers(query: string): Promise<PDDIKTILecturer[]> {
    try {
      const response = await fetch(`${this.baseURL}/search/dosen?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to fetch lecturers')
      return await response.json()
    } catch (error) {
      console.error('Error searching lecturers:', error)
      throw error
    }
  }

  async searchStudents(query: string): Promise<PDDIKTIStudent[]> {
    try {
      const response = await fetch(`${this.baseURL}/search/mahasiswa?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to fetch students')
      return await response.json()
    } catch (error) {
      console.error('Error searching students:', error)
      throw error
    }
  }

  // University endpoints
  async getUniversityById(id: string): Promise<PDDIKTIUniversity> {
    try {
      const response = await fetch(`${this.baseURL}/universitas/${id}`)
      if (!response.ok) throw new Error('Failed to fetch university')
      return await response.json()
    } catch (error) {
      console.error('Error fetching university:', error)
      throw error
    }
  }

  async getUniversityPrograms(id: string): Promise<PDDIKTIProgram[]> {
    try {
      const response = await fetch(`${this.baseURL}/universitas/${id}/program-studi`)
      if (!response.ok) throw new Error('Failed to fetch university programs')
      return await response.json()
    } catch (error) {
      console.error('Error fetching university programs:', error)
      throw error
    }
  }

  // Program endpoints
  async getProgramById(id: string): Promise<PDDIKTIProgram> {
    try {
      const response = await fetch(`${this.baseURL}/program-studi/${id}`)
      if (!response.ok) throw new Error('Failed to fetch program')
      return await response.json()
    } catch (error) {
      console.error('Error fetching program:', error)
      throw error
    }
  }

  // Lecturer endpoints
  async getLecturerById(id: string): Promise<PDDIKTILecturer> {
    try {
      const response = await fetch(`${this.baseURL}/dosen/${id}`)
      if (!response.ok) throw new Error('Failed to fetch lecturer')
      return await response.json()
    } catch (error) {
      console.error('Error fetching lecturer:', error)
      throw error
    }
  }

  // Student endpoints
  async getStudentById(id: string): Promise<PDDIKTIStudent> {
    try {
      const response = await fetch(`${this.baseURL}/mahasiswa/${id}`)
      if (!response.ok) throw new Error('Failed to fetch student')
      return await response.json()
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  }

  // Statistics endpoints
  async getStatistics(): Promise<PDDIKTIStats> {
    try {
      const response = await fetch(`${this.baseURL}/statistik`)
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  }

  // Helper methods untuk SIAKAD STIM
  async syncStudentData(nim: string): Promise<PDDIKTIStudent | null> {
    try {
      const students = await this.searchStudents(nim)
      const student = students.find(s => s.nim === nim)
      return student || null
    } catch (error) {
      console.error('Error syncing student data:', error)
      return null
    }
  }

  async syncLecturerData(nidn: string): Promise<PDDIKTILecturer | null> {
    try {
      const lecturers = await this.searchLecturers(nidn)
      const lecturer = lecturers.find(l => l.nidn === nidn)
      return lecturer || null
    } catch (error) {
      console.error('Error syncing lecturer data:', error)
      return null
    }
  }

  async getSTIMData(): Promise<PDDIKTIUniversity | null> {
    try {
      const universities = await this.searchUniversities('STIM Surakarta')
      return universities.find(u => 
        u.nama.toLowerCase().includes('stim') && 
        u.nama.toLowerCase().includes('surakarta')
      ) || null
    } catch (error) {
      console.error('Error fetching STIM data:', error)
      return null
    }
  }
}

export const pddiktiService = new PDDIKTIService()
