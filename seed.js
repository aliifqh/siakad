const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Hash password untuk semua user
    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. Buat Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@siakad.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created:', adminUser.email)

    // 2. Buat Lecturer User dan Data Lecturer
    const lecturerUser = await prisma.user.create({
      data: {
        email: 'dosen@siakad.com',
        password: hashedPassword,
        role: 'LECTURER'
      }
    })

    const lecturer = await prisma.lecturer.create({
      data: {
        nidn: '1234567890',
        name: 'Dr. Ahmad Wijaya, M.Kom',
        email: 'dosen@siakad.com',
        phone: '081234567890',
        position: 'Dosen Tetap',
        department: 'Teknik Informatika',
        userId: lecturerUser.id
      }
    })
    console.log('✅ Lecturer created:', lecturer.name)

    // 3. Buat Student User dan Data Student
    const studentUser = await prisma.user.create({
      data: {
        email: 'mahasiswa@siakad.com',
        password: hashedPassword,
        role: 'STUDENT'
      }
    })

    const student = await prisma.student.create({
      data: {
        nim: '2021001',
        name: 'Budi Santoso',
        email: 'mahasiswa@siakad.com',
        phone: '081234567891',
        address: 'Jl. Merdeka No. 123, Jakarta',
        program: 'Teknik Informatika',
        semester: 5,
        status: 'ACTIVE',
        userId: studentUser.id
      }
    })
    console.log('✅ Student created:', student.name)

    // 4. Buat beberapa mata kuliah
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          code: 'IF101',
          name: 'Pemrograman Dasar',
          credits: 3,
          semester: 1,
          description: 'Mata kuliah dasar pemrograman',
          lecturerId: lecturer.id
        }
      }),
      prisma.course.create({
        data: {
          code: 'IF102',
          name: 'Struktur Data',
          credits: 3,
          semester: 2,
          description: 'Mata kuliah struktur data dan algoritma',
          lecturerId: lecturer.id
        }
      }),
      prisma.course.create({
        data: {
          code: 'IF201',
          name: 'Basis Data',
          credits: 3,
          semester: 3,
          description: 'Mata kuliah sistem basis data',
          lecturerId: lecturer.id
        }
      }),
      prisma.course.create({
        data: {
          code: 'IF202',
          name: 'Pemrograman Web',
          credits: 3,
          semester: 4,
          description: 'Mata kuliah pengembangan aplikasi web',
          lecturerId: lecturer.id
        }
      })
    ])
    console.log('✅ Courses created:', courses.length, 'courses')

    // 5. Buat beberapa mahasiswa lagi
    const additionalStudents = await Promise.all([
      prisma.user.create({
        data: {
          email: 'siti@siakad.com',
          password: hashedPassword,
          role: 'STUDENT'
        }
      }).then(user => 
        prisma.student.create({
          data: {
            nim: '2021002',
            name: 'Siti Nurhaliza',
            email: 'siti@siakad.com',
            phone: '081234567892',
            program: 'Teknik Informatika',
            semester: 3,
            status: 'ACTIVE',
            userId: user.id
          }
        })
      ),
      prisma.user.create({
        data: {
          email: 'andi@siakad.com',
          password: hashedPassword,
          role: 'STUDENT'
        }
      }).then(user => 
        prisma.student.create({
          data: {
            nim: '2021003',
            name: 'Andi Pratama',
            email: 'andi@siakad.com',
            phone: '081234567893',
            program: 'Teknik Informatika',
            semester: 7,
            status: 'ACTIVE',
            userId: user.id
          }
        })
      )
    ])
    console.log('✅ Additional students created:', additionalStudents.length)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Test Users:')
    console.log('Admin: admin@siakad.com / password123')
    console.log('Dosen: dosen@siakad.com / password123')
    console.log('Mahasiswa: mahasiswa@siakad.com / password123')
    console.log('Mahasiswa: siti@siakad.com / password123')
    console.log('Mahasiswa: andi@siakad.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
