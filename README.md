# SIAKAD STIM Surakarta

Sistem Informasi Akademik untuk STIM Surakarta yang dibangun dengan Next.js, TypeScript, dan Prisma.

## Fitur

- ✅ **Authentication System** - Login/Register dengan JWT
- ✅ **Role-based Access** - Admin, Dosen, Mahasiswa
- ✅ **Database Schema** - Mahasiswa, Dosen, Mata Kuliah, KRS, Nilai
- ✅ **Dashboard** - Interface berbeda berdasarkan role
- ✅ **PDDIKTI Integration** - Sinkronisasi dengan PDDIKTI menggunakan API wrapper
- 🔄 **CRUD Operations** - Manajemen data akademik
- 🔄 **KRS System** - Kartu Rencana Studi

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Icons**: Lucide React

## Setup Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat file `.env.local` di root project:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/siakad_stim"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# PDDIKTI API (akan diisi nanti)
PDDIKTI_API_URL="https://api.pddikti.kemdikbud.go.id"
PDDIKTI_API_KEY="your-pddikti-api-key"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# (Optional) Seed database dengan data sample
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## Struktur Project

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── students/          # Student management
│   │   ├── lecturers/         # Lecturer management
│   │   ├── courses/           # Course management
│   │   └── krs/               # KRS management
│   ├── auth/                  # Auth pages (login, register)
│   ├── dashboard/             # Dashboard pages
│   └── layout.tsx            # Root layout
├── components/                # Reusable components
│   ├── ui/                   # Basic UI components
│   ├── forms/                # Form components
│   └── layout/               # Layout components
├── lib/                      # Utilities
│   ├── database.ts           # Prisma client
│   └── auth.ts               # Auth utilities
└── types/                    # TypeScript types
    └── index.ts              # Type definitions
```

## Database Schema

### Users
- id, email, password, role, timestamps

### Students
- id, nim, name, email, phone, address, program, semester, status, userId

### Lecturers
- id, nidn, name, email, phone, position, department, userId

### Courses
- id, code, name, credits, semester, description, lecturerId

### KRS (Kartu Rencana Studi)
- id, studentId, courseId, semester, year, status

### Grades
- id, studentId, courseId, semester, year, grade, score

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Lecturers
- `GET /api/lecturers` - Get all lecturers
- `POST /api/lecturers` - Create new lecturer
- `GET /api/lecturers/[id]` - Get lecturer by ID
- `PUT /api/lecturers/[id]` - Update lecturer
- `DELETE /api/lecturers/[id]` - Delete lecturer

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/[id]` - Get course by ID
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### PDDIKTI Integration
- `GET /api/pddikti/search` - Search data PDDIKTI
- `GET /api/pddikti/sync/student` - Sync data mahasiswa dari PDDIKTI
- `GET /api/pddikti/sync/lecturer` - Sync data dosen dari PDDIKTI
- `GET /api/pddikti/stim` - Get data STIM Surakarta dari PDDIKTI
- `GET /api/pddikti/statistics` - Get statistik nasional pendidikan tinggi

## Deployment

### cPanel Deployment

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload semua file ke `public_html`
   - Pastikan file `.env.local` sudah di-set di cPanel

3. **Setup Database**
   - Buat database PostgreSQL di cPanel
   - Update `DATABASE_URL` di environment variables
   - Run migration: `npx prisma migrate deploy`

4. **Configure Node.js App**
   - Gunakan tab "Node.js App" di cPanel
   - Set startup file ke `server.js`
   - Install dependencies: `npm install`

## Next Steps

1. **Implementasi CRUD** untuk semua entitas
2. **Sistem KRS** yang lengkap
3. **Integrasi PDDIKTI** API
4. **Sistem Penilaian** dan transkrip
5. **Laporan Akademik**
6. **Dashboard Analytics**

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - lihat file LICENSE untuk detail.