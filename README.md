# ☁️ Drive X

A powerful, blazing-fast, encrypted Google Drive clone built with the **PERN** stack (PostgreSQL, Express, React, Node.js) and **Supabase Storage**.

## 📦 About

**Drive X** is your private, smart cloud file manager designed to simplify file storage while giving you control. Think Google Drive — but open-source, developer-friendly, and yours.

## ✨ Features

- 📁 **Smart Folders** – auto-categorized by file type, usage, or tags
- ⚡ **Lightning-fast Uploads** – powered by Supabase’s object storage
- 🔐 **End-to-End Encryption** – because privacy shouldn’t be optional
- 🔄 **Real-time Sync** - Changes update instantly across all your devices
- 🔍 **Search & Filter**
- 📊 **Storage Usage Visualization**
- 🧠 **User Auth + Role-Based Access**
- 🧰 **Admin Panel**

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth with JWT

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Supabase account

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Esaius2058/file_uploader.git
   cd file_uploader
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   cd packages/frontend
   npm install
   cd ../packages/frontend
   npm install
   ```

3. **Set Up Environment**:

   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_or_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the App**

   ```bash
   # In client folder
   npm run dev

   #In server folder
   npm run build
   npm start
   ```

   Visit http://localhost:5173 in your browser.

## 🔐 Security

All files are:

    Encrypted before upload (E2EE optional toggle)

    Authenticated via Supabase Auth

    Isolated per user with RLS (Row-Level Security) and storage policies


## 📚 Documentation
Want to dig deeper? Check out the Docs.

## 🤝 Contributing
1. Fork the repo

2. Create a branch (git checkout -b feature/new-feature)

3. Commit your changes (git commit -am 'Add new feature')

4. Push and create a PR

## 📜 License
MIT License - see [LICENSE](https://opensource.org/license/mit) for details

**Drive X** - Your files, secured and organized in the cloud.