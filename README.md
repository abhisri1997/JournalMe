# JournalMe 📝

A modern, full-stack journaling application with voice recording capabilities built with TypeScript, React, and Node.js.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-22-green)

## ✨ Features

- 📱 **Responsive Design** - Mobile-first UI that works seamlessly on all devices (3-column post grid on mobile)
- 🎙️ **Voice Recording** - Record audio journal entries directly in the browser
- 📸 **Image & Video Support** - Upload photos and videos to your journal entries
- 🎨 **Modern Indian Design** - Culturally-inspired terracotta and indigo color theme
- 🌓 **Dark/Light Mode** - Toggle between themes with persistent preference
- 🔐 **User Authentication** - Secure registration and login with JWT
- 👤 **User Profiles** - Customize your display name and manage account settings
- 🔐 **Password Reset** - Secure email-based password recovery
- 📊 **Social Features** - Follow users, manage followers, and community interactions
- 💾 **Persistent Storage** - PostgreSQL database with Prisma ORM
- 🔒 **HTTPS Support** - Built-in HTTPS for secure mobile access
- 📝 **Rich Journal Entries** - Text, audio, images, and videos in a single post
- ♾️ **Infinite Pagination** - Load more posts as you scroll (20 posts per page)
- 🎯 **Public/Private Entries** - Control visibility of your journal entries

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router v7** for navigation
- **Tailwind CSS v4** for responsive styling
- **Vitest** and React Testing Library for testing
- **MediaRecorder API** for audio recording
- **Web Audio API** for audio level monitoring
- **Multer** for file upload handling

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM for database management
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads

### DevOps

- **Docker Compose** for PostgreSQL
- **ts-node-dev** for hot reload in development
- **Monorepo** structure with npm workspaces

## �� Quick Start

### Prerequisites

- Node.js 22+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/JournalMe.git
   cd JournalMe
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start PostgreSQL**

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/journalme
   JWT_SECRET=your-secret-key-change-in-production
   PORT=4000
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Start development servers**

   ```bash
   # Terminal 1: Backend
   npm --workspace @journalme/backend run dev

   # Terminal 2: Frontend
   npm --workspace @journalme/frontend run dev
   ```

7. **Open the app**
   - Frontend: https://localhost:5174
   - Backend: http://localhost:4000

## 📂 Project Structure

```
JournalMe/
├── packages/
│   ├── backend/              # Express API server
│   │   ├── src/
│   │   │   ├── routes/       # API routes (auth, users, journals)
│   │   │   ├── middleware/   # Auth & validation
│   │   │   └── __tests__/    # Backend tests
│   │   └── uploads/          # Audio file storage
│   └── frontend/             # React application
│       ├── src/
│       │   ├── components/   # Reusable components (Header, ProfileMenu)
│       │   ├── pages/        # Route pages (Journal, Profile, Settings)
│       │   └── __tests__/    # Frontend tests
│       └── e2e/              # Playwright tests
├── prisma/                   # Database schema & migrations
├── certs/                    # HTTPS certificates (dev)
└── docker-compose.yml        # PostgreSQL container
```

## 🔧 API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/forgot-password` - Request password reset link
- `POST /api/auth/reset-password` - Reset password with token

### Users

- `GET /api/users/me` - Get current user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users/search?q=query` - Search users by email or name

### Journals

- `GET /api/journals?limit=20&skip=0` - Get paginated journal entries (requires auth)
- `POST /api/journals` - Create a new journal entry with optional media (requires auth)
- `GET /api/journals/:id` - Get a specific journal entry (requires auth)
- `DELETE /api/journals/:id` - Delete a journal entry (requires auth)

### Follows

- `POST /api/follows/:userId` - Send follow request
- `PUT /api/follows/:followId` - Accept/reject follow request
- `DELETE /api/follows/:followId` - Unfollow a user
- `GET /api/follows/connections` - Get followers and following lists

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm --workspace @journalme/frontend test

# Run backend tests
npm --workspace @journalme/backend test

# Run E2E tests
npm --workspace @journalme/frontend run test:e2e
```

## 📱 Mobile Access

To access the app from mobile devices on your local network:

1. Ensure HTTPS certificates are generated:

   ```bash
   mkdir -p certs
   openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes
   ```

2. Start the dev servers

3. Note the Network URL from Vite output (e.g., `https://192.168.x.x:5174`)

4. Access this URL from your mobile device

5. Accept the self-signed certificate warning

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for a simple, privacy-focused journaling app
- Audio recording powered by browser native APIs

## 📞 Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/yourusername/JournalMe/issues)
- Check existing [discussions](https://github.com/yourusername/JournalMe/discussions)

## 🗺️ Roadmap

- [ ] AI-powered journal insights
- [ ] Multi-device sync
- [ ] Journal templates
- [ ] Export functionality (PDF, Markdown)
- [ ] Tags and categories
- [ ] Search functionality
- [ ] Journal statistics and analytics

---

Made with ❤️ by the JournalMe team
