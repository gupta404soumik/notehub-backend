# 🚀 NoteHub - Collaborative Study Notes Platform

A GitHub-like collaborative platform for educational notes, designed for Indian school and competitive exam students (Classes 10-12, WBJEE, JEE, NEET prep).

## 📋 About The Project

NoteHub enables version-controlled, community-curated study notes with:
- Real-time collaborative editing
- Quality filtering
- Open-source contribution workflows

**Core Philosophy:** "Best notes from the community, organized like code, accessible to everyone."

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Logging:** Winston

### Frontend (Coming Soon)
- **Framework:** React 18+
- **Styling:** TailwindCSS
- **Editor:** Monaco Editor
- **Real-time:** Socket.io Client

---

## ✅ Completed Features

### 🔐 Authentication
- [x] User Registration
- [x] User Login
- [x] JWT Token Authentication (15-min access, 7-day refresh)
- [x] Refresh Token
- [x] Logout
- [x] Password Hashing with bcrypt

### 📚 Repository System
- [x] Create Repository
- [x] Get All Repositories
- [x] Get Repository by ID
- [x] Update Repository
- [x] Delete Repository
- [x] Star Repository

### 📝 Document System
- [x] Create Document (Markdown)
- [x] Get All Documents
- [x] Get Document by ID
- [x] Update Document (with commit history)
- [x] Delete Document
- [x] Version History (commits)

### 💬 Comments System
- [x] Create Comment
- [x] Get Comments (with nested replies)
- [x] Edit Comment
- [x] Delete Comment (soft delete)
- [x] Vote Helpful/Not Helpful
- [x] Threaded Replies

### 🔴 Real-time Collaboration
- [x] Socket.io Setup
- [x] JWT Socket Authentication
- [x] Document Room Join/Leave
- [x] Live Edit Broadcasting
- [x] Active Users Presence
- [x] Cursor Position Tracking
- [x] Auto-save
- [x] Typing Indicator

---

## 🚧 Upcoming Features

### Backend
- [ ] Issues System (Error/Correction reports)
- [ ] Pull Request System (Fork → Edit → PR → Merge)
- [ ] Search System (Full-text search)
- [ ] User Profile CRUD
- [ ] Notifications
- [ ] File Upload (PDF/Images)

### Frontend
- [ ] React Setup
- [ ] Login/Register Pages
- [ ] Dashboard
- [ ] Repository List
- [ ] Document Editor (Monaco)
- [ ] Real-time Collaboration UI

---

## 📁 Project Structure
notehub-backend/
├── src/
│ ├── config/
│ │ ├── db.js # MongoDB Connection
│ │ └── socket.js # Socket.io Setup
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── Repositorycontroller.js
│ │ ├── documentController.js
│ │ └── commentController.js
│ ├── middleware/
│ │ └── auth.js # JWT Verification
│ ├── models/
│ │ ├── user.js
│ │ ├── Repository.js
│ │ ├── Document.js
│ │ └── Comment.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── RepositoryRoutes.js
│ │ ├── documentRoutes.js
│ │ └── commentRoutes.js
│ └── server.js # Main Server File
├── .env # Environment Variables (Not in Git)
├── .gitignore
├── package.json
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas Account
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/notehub-backend.git
cd notehub-backend
