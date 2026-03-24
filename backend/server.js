const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const postRoutes         = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes        = require('./routes/adminRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');
const { setupSocket }  = require('./utils/socket');

const app        = express();
const httpServer = createServer(app);

// ✅ FIXED CORS (IMPORTANT)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://social-media-tu4w.onrender.com"
];

// Socket
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});
setupSocket(io);
app.set('io', io);

// Middleware
app.use(helmet());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(null, true);
    }
  },
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

// Error
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('🔑 Gemini Key Loaded:', process.env.GEMINI_API_KEY ? "YES" : "NO");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Backend URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
