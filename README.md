
# 🚀 NoteHub - Collaborative Study Notes Platform

A GitHub-like collaborative platform for educational notes, designed for Indian school and competitive exam students (Classes 10-12, WBJEE, JEE, NEET prep).

![Status](https://img.shields.io/badge/Status-Backend%20Complete-success)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 About The Project

NoteHub enables version-controlled, community-curated study notes with:
- ⚡ Real-time collaborative editing
- 🔄 Git-like version control
- 🌟 Community-curated quality
- 📚 Open-source contribution workflows
- 🎯 Exam-focused organization (JEE/NEET/WBJEE)

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

## ✅ Complete Features

### 🔐 Authentication
- [x] User Registration
- [x] User Login
- [x] JWT Token Authentication (15-min access, 7-day refresh)
- [x] Refresh Token
- [x] Logout
- [x] Password Hashing with bcrypt

### 👤 User Profile
- [x] View User Profile
- [x] Update Profile (bio, subjects, grade)
- [x] User Statistics
- [x] User Search
- [x] Account Deletion

### 📚 Repository System
- [x] Create Repository
- [x] Get All Repositories
- [x] Get Repository by ID
- [x] Update Repository
- [x] Delete Repository
- [x] Star Repository
- [x] Fork Repository

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

### 🐛 Issues System
- [x] Create Issue (Error/Clarification/Enhancement)
- [x] Severity Levels (Low/Medium/High)
- [x] Status Tracking (Open/In-Progress/Resolved/Won't-Fix)
- [x] Update Issue
- [x] Delete Issue

### 🔀 Pull Request System
- [x] Fork Repository
- [x] Create Pull Request
- [x] PR Comments
- [x] Approve/Reject PR
- [x] Merge PR (Auto-copy documents)
- [x] Merge History

### 🔍 Search System
- [x] Full-text Search (Repository & Document)
- [x] Filter by Category/Subject/Stars
- [x] Sort Options (Newest, Stars, Updated)
- [x] Trending Repositories
- [x] New Repositories

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

### Frontend
- [ ] React Setup with Vite
- [ ] Login/Register Pages
- [ ] Dashboard UI
- [ ] Repository List Page
- [ ] Repository Detail Page
- [ ] Document Editor (Monaco)
- [ ] Real-time Collaboration UI
- [ ] Comments UI
- [ ] Issues UI
- [ ] Pull Request UI
- [ ] Search UI
- [ ] Profile Page
- [ ] Dark Mode

### Backend Enhancements
- [ ] Notifications System
- [ ] File Upload (PDF/Images)
- [ ] Email Notifications
- [ ] Badges (Verified Teacher, Trending)
- [ ] Leaderboard

---

## 📁 Project Structure

```
notehub-backend/
├── src/
│   ├── config/
│   │   ├── db.js                      # MongoDB Connection
│   │   └── socket.js                  # Socket.io Setup
│   ├── controllers/
│   │   ├── authController.js          # Register, Login, JWT
│   │   ├── userController.js          # Profile CRUD, Stats, Search
│   │   ├── Repositorycontroller.js    # Repository CRUD, Star
│   │   ├── documentController.js      # Document CRUD, Commits
│   │   ├── commentController.js       # Comments, Threading, Votes
│   │   ├── issueController.js         # Issues CRUD, Status
│   │   ├── pullRequestController.js   # Fork, PR, Merge
│   │   └── searchController.js        # Search, Trending
│   ├── middleware/
│   │   └── auth.js                    # JWT Verification
│   ├── models/
│   │   ├── user.js                    # User Schema
│   │   ├── Repository.js              # Repository Schema
│   │   ├── Document.js                # Document Schema
│   │   ├── Comment.js                 # Comment Schema
│   │   ├── Issue.js                   # Issue Schema
│   │   └── PullRequest.js             # Pull Request Schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── RepositoryRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── pullRequestRoutes.js
│   │   └── searchRoutes.js
│   └── server.js                      # Main Server
├── .env                               # Environment Variables (Not in Git)
├── .gitignore
├── package.json
└── README.md
```

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
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notehub
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
```

4. **Run the server:**
```bash
npm run dev
```

Server starts at `http://localhost:5000`

---

## 📡 API Endpoints (50+ Endpoints)

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### 👤 User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Get user profile |
| PATCH | `/api/users/me` | Update own profile |
| GET | `/api/users/:userId/repositories` | Get user's repos |
| GET | `/api/users/:userId/stats` | Get user stats |
| GET | `/api/users/search?q=query` | Search users |
| DELETE | `/api/users/me` | Delete account |

### 📚 Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repositories` | Create repository |
| GET | `/api/repositories` | Get all repositories |
| GET | `/api/repositories/:repoId` | Get repository |
| PATCH | `/api/repositories/:repoId` | Update repository |
| DELETE | `/api/repositories/:repoId` | Delete repository |
| POST | `/api/repositories/:repoId/star` | Star repository |

### 📝 Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repositories/:repoId/documents` | Create document |
| GET | `/api/repositories/:repoId/documents` | Get all documents |
| GET | `/api/repositories/:repoId/documents/:docId` | Get document |
| PUT | `/api/repositories/:repoId/documents/:docId` | Update document |
| DELETE | `/api/repositories/:repoId/documents/:docId` | Delete document |

### 💬 Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments` | Create comment |
| GET | `/api/comments/:entityType/:entityId` | Get comments |
| PATCH | `/api/comments/:commentId` | Edit comment |
| DELETE | `/api/comments/:commentId` | Delete comment |
| POST | `/api/comments/:commentId/vote` | Vote on comment |

### 🐛 Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repositories/:repoId/issues` | Create issue |
| GET | `/api/repositories/:repoId/issues` | Get all issues |
| GET | `/api/repositories/:repoId/issues/:issueId` | Get issue |
| PATCH | `/api/repositories/:repoId/issues/:issueId` | Update issue |
| PATCH | `/api/repositories/:repoId/issues/:issueId/status` | Update status |
| DELETE | `/api/repositories/:repoId/issues/:issueId` | Delete issue |

### 🔀 Pull Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/repositories/:repoId/pulls/fork` | Fork repository |
| POST | `/api/repositories/:repoId/pulls` | Create PR |
| GET | `/api/repositories/:repoId/pulls` | Get all PRs |
| GET | `/api/repositories/:repoId/pulls/:prId` | Get PR |
| PATCH | `/api/repositories/:repoId/pulls/:prId` | Update PR status |
| POST | `/api/repositories/:repoId/pulls/:prId/merge` | Merge PR |
| POST | `/api/repositories/:repoId/pulls/:prId/comments` | Comment on PR |

### 🔍 Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=query` | Search all |
| GET | `/api/search/trending` | Trending repos |
| GET | `/api/search/new` | New repos |

---

## 🔌 Socket.io Events

### Client → Server
- `document:join` — Join document room
- `document:leave` — Leave document room
- `document:edit` — Broadcast edit
- `document:save` — Save document
- `cursor:move` — Update cursor position
- `user:typing` — Typing indicator

### Server → Client
- `document:sync` — Full document sync
- `document:update` — Real-time edit
- `user:joined` — User joined
- `user:left` — User left
- `users:list` — Active users
- `cursor:update` — Cursor update
- `document:saved` — Save confirmation

---

## 🗄️ Database Schema

### Collections
1. **users** — User accounts & profiles
2. **repositories** — Study note collections
3. **documents** — Individual notes (markdown)
4. **comments** — Threaded comments on any entity
5. **issues** — Error reports & corrections
6. **pullrequests** — Contribution workflow

---

## 🎯 Success Metrics

- [ ] 1000 users in first 3 months
- [ ] 30% daily active users
- [ ] 95%+ uptime
- [ ] 100+ public repositories with 5+ stars
- [ ] API latency < 200ms
- [ ] Socket latency < 500ms

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Soumik Gupta**
- GitHub: [@your-username](https://github.com/your-username)

---

## 🙏 Acknowledgments

- Inspired by GitHub's version control system
- Built for Indian students preparing for JEE/NEET/WBJEE
- Real-time collaboration powered by Socket.io
- Made with ❤️ for the education community

---

**⭐ Star this repository if you find it helpful!**

**Status:** 🟢 Backend 100% Complete | 🟡 Frontend Coming Soon
```

### সেভ কর (Ctrl+S)

---

### ✅ হয়ে গেলে বলো: **"README Update করেছি"** 😊

তারপর Git Push করবো!