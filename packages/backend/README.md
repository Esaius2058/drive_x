# 🛠️ Drive X Backend API

A Node.js/Express backend for handling file uploads with Multer, JWT authentication, and Supabase storage.

## 📦 Features

- File upload with size and type validation
- JWT authentication
- Supabase storage integration
- Organized folder structure
- TypeScript support
- Error handling middleware

## Getting Started

### Prerequisites

- Node.js 16+
- npm/yarn
- Supabase account
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/esaius2058/file-uploader.git
cd packages/backend
```

2. Install dependencies
```bash
npm install
    or
yarn install
```

3. Create .env file

PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/drive_x
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=user-files

4. Running the Server

```bash
npm run dev
  or
yarn dev
```

### 🗂 Project Structure

```bash
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server initialization
├── .env.example           # Environment variables template
├── package.json
└── tsconfig.json
```


### ⚙️ API Endpoints
**Authentication**

    POST /api/auth/login - User login

    POST /api/auth/register - User registration

**File Operations**

    POST /api/upload - Upload single file

        Field name: file (multipart/form-data)

        Max size: 15MB

        Allowed types: jpeg, png, pdf

    POST /api/upload-multiple - Upload multiple files

    GET /api/files - List all files

    DELETE /api/files/:id - Delete a file

**Folder Operations**

    POST /api/folders - Create new folder

    GET /api/folders - List all folders

    GET /api/folders/:id - Get folder details


**Error Handling**

Custom error middleware handles:

    Multer errors (file size, type)

    JWT validation errors

    Database errors

    404 routes


### Database

Managed with Prisma + Supabase Postgres. Example models:

```ts
model File {
  id          String   @id @default(uuid())
  name        String
  userId      String
  size        Int
  mimetype    String
  storagePath String
  createdAt   DateTime @default(now())
}
```

### Docker
```bash
docker build -t my-backend .
docker run -p 3000:3000 my-backend
```

### Contributing

    Fork the project

    Create your feature branch (git checkout -b feature/AmazingFeature)

    Commit your changes (git commit -m 'Add some AmazingFeature')

    Push to the branch (git push origin feature/AmazingFeature)

    Open a Pull Request

### 📜 License
MIT — do whatever, just don't sell it as-is and call it your masterpiece

### ✉️ Contact
Isaiah - wabwirewild@gmail.com