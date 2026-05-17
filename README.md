# Social Media Platform

A fully-featured, real-time Social Media application built using the MERN stack (MongoDB, Express, React, Node.js). It includes a sleek UI powered by Vite and Tailwind CSS, real-time interactions with Socket.IO, media uploads via Cloudinary, and robust authentication using JWT and Email OTP.

## Key Features

- **Authentication & Security:** Secure JWT-based authentication, email verification via OTP, and password recovery.
- **Real-Time Chat & Notifications:** Instant messaging and real-time alerts for likes, comments, and follows using Socket.IO.
- **Media Uploads:** Seamless image and media handling with Cloudinary integration.
- **Dynamic Feed & Explore:** Personalized user feeds and an explore page to discover new content and users.
- **Admin Dashboard:** Built-in admin panel to manage users, monitor posts, and maintain the platform.
- **Modern UI/UX:** Responsive, glassmorphic design crafted with React, Tailwind CSS, and Heroicons.

## Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State & Notifications:** Context API, React Hot Toast

### Backend
- **Server:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Real-Time:** Socket.IO
- **Auth & Services:** JWT, Nodemailer, Cloudinary

## Project Structure

```text
Social-Media-Platform/
├── backend/        # Node.js + Express API & Socket server
├── frontend/       # React + Vite frontend application
└── render.yaml     # Render Blueprint for automated deployment
```

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/anuragverma4895/Social-Media-Platform.git
cd Social-Media-Platform
```

### 2. Configure Environment Variables
Create `.env` files in both the `frontend/` and `backend/` directories. Use the provided `.env.example` files as templates.

**Backend Required Variables (`backend/.env`):**
```env
MONGO_URI=your_mongodb_connection_string
ADMIN_SECRET_KEY=your_admin_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
JWT_SECRET=your_jwt_secret
```

### 3. Install Dependencies & Run

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start the Frontend:**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The application will be running locally at `http://localhost:5173`.

## Deployment (Render)

This project includes a `render.yaml` Blueprint for easy, automated deployment.

1. Push your repository to GitHub.
2. In your Render dashboard, create a new Blueprint and connect this repository.
3. Render will automatically provision two services:
   - `social-media-platform-backend` (Web Service)
   - `social-media-platform-frontend` (Static Site)
4. Fill in the required environment variables when prompted by Render.
5. Deploy the Blueprint. Render will handle the rest, including injecting the backend URL into the frontend build.

---
*Built for a modern social web experience.*
