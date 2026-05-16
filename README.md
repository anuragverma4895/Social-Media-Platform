# Social Media Platform

MERN social media app with a Vite React frontend, Express/MongoDB backend, Cloudinary uploads, email OTP, JWT auth, admin panel, and Socket.IO realtime features.

## Project Structure

```text
Social-Media-Platform/
  backend/        Node.js + Express API
  frontend/       React + Vite frontend
  render.yaml     Render Blueprint for both services
```

## Local Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend, in another terminal
cd backend
npm install
npm run dev
```

Create `frontend/.env` from `frontend/.env.example` and `backend/.env` from `backend/.env.example`.

## Render Deployment

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Render will read `render.yaml` and create:
   - `social-media-platform-backend`
   - `social-media-platform-frontend`
4. Fill the required backend environment variables when Render asks for them.
5. Deploy the Blueprint.

The frontend receives the backend URL from the backend service's `RENDER_EXTERNAL_URL`, then builds with `VITE_BACKEND_URL`. The backend allows local origins and Render `*.onrender.com` origins by default. Add custom domains to `CORS_ORIGINS` later if needed.

## Required Backend Environment Variables

```text
MONGO_URI
ADMIN_SECRET_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
GEMINI_API_KEY
OPENAI_API_KEY
```
