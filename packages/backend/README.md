# Drive X Backend API

A Node.js/Express backend for handling file uploads with Multer, JWT authentication, and Supabase storage.

## 📦 Features

- File upload with size and type validation
- JWT authentication
- Supabase storage integration
- Organized folder structure
- TypeScript support
- Error handling middleware

## 🚀 Getting Started

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

2.Install dependencies

npm install
# or
yarn install

    Create .env file


JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000

Running the Server

- npm run dev
# or
- yarn dev

🗂 Project Structure

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

📌 API Endpoints
Authentication

    POST /api/auth/login - User login

    POST /api/auth/register - User registration

File Operations

    POST /api/upload - Upload single file

        Field name: file (multipart/form-data)

        Max size: 15MB

        Allowed types: jpeg, png, pdf

    POST /api/upload-multiple - Upload multiple files

    GET /api/files - List all files

    DELETE /api/files/:id - Delete a file

Folder Operations

    POST /api/folders - Create new folder

    GET /api/folders - List all folders

    GET /api/folders/:id - Get folder details


Error Handling

Custom error middleware handles:

    Multer errors (file size, type)

    JWT validation errors

    Database errors

    404 routes

🤝 Contributing

    Fork the project

    Create your feature branch (git checkout -b feature/AmazingFeature)

    Commit your changes (git commit -m 'Add some AmazingFeature')

    Push to the branch (git push origin feature/AmazingFeature)

    Open a Pull Request

📄 License

Distributed under the MIT License.
✉️ Contact

Isaiah - wabwirewild@gmail.com