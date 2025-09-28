export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'LECTURER' | 'STUDENT'
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  id: string
  nim: string
  name: string
  email: string
  phone?: string
  address?: string
  program: string
  semester: number
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPOUT'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Lecturer {
  id: string
  nidn: string
  name: string
  email: string
  phone?: string
  position: string
  department: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  semester: number
  description?: string
  lecturerId: string
  lecturer?: Lecturer
  createdAt: Date
  updatedAt: Date
}

export interface KRS {
  id: string
  studentId: string
  courseId: string
  semester: string
  year: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  student?: Student
  course?: Course
  createdAt: Date
  updatedAt: Date
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  semester: string
  year: number
  grade: string
  score?: number
  student?: Student
  course?: Course
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: 'ADMIN' | 'LECTURER' | 'STUDENT'
  studentData?: {
    nim: string
    name: string
    program: string
    semester: number
  }
  lecturerData?: {
    nidn: string
    name: string
    position: string
    department: string
  }
}

export interface AuthResponse {
  user: User
  token: string
}
