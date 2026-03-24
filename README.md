# Social-Media-Platform

# 🚀 SocialMERN — Full Stack Social Media Platform

A production-ready social media platform built with MERN stack + Vite + AI features.

## 🗂️ Project Structure

```
socialmern/
├── backend/              ← Node.js + Express API
│   ├── config/           ← DB & Cloudinary config
│   ├── controllers/      ← Route logic
│   ├── middleware/       ← Auth, error, validation
│   ├── models/           ← MongoDB schemas
│   ├── routes/           ← API routes
│   ├── utils/            ← Email, JWT, Socket
│   ├── server.js
│   └── package.json
│
├── public/               ← Static assets
├── src/                  ← React frontend
│   ├── components/       ← Reusable UI components
│   ├── context/          ← Auth + Socket context
│   ├── pages/            ← Auth, User, Admin pages
│   └── services/         ← Axios API client
│
├── index.html            ← Vite entry point
├── package.json          ← Frontend dependencies
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── SETUP.md              ← Local setup guide
├── DEPLOYMENT.md         ← Deploy to Vercel + Render
└── CHECKLIST.md          ← Pre-deploy checklist
```

## ⚡ Features
- JWT Auth + Email OTP Verification
- Follow/Unfollow, Feed, Explore
- Post with Image Upload (Cloudinary)
- Like, Comment, Share
- Real-time Notifications (Socket.io)
- 🤖 Smart Hashtag Generator
- 🤖 Toxic Comment Detection
- 🛡️ Admin Panel (ban users, moderate posts)

## 🚀 Quick Start

```bash
# 1. Install frontend deps
npm install

# 2. Install backend deps
cd backend && npm install && cd ..

# 3. Setup .env files (see SETUP.md)

# 4. Run
cd backend && npm run dev   # Terminal 1
npm run dev                 # Terminal 2 (root)
```

See **SETUP.md** for detailed instructions.
See **DEPLOYMENT.md** for Vercel + Render deployment.
