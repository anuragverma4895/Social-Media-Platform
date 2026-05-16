const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');
const { setupSocket } = require('./utils/socket');

const app = express();
const httpServer = createServer(app);

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.CORS_ORIGINS),
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.includes('*') || allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname } = new URL(normalizedOrigin);
    return hostname === 'localhost' || hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
};

const corsOriginHandler = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true);
  }

  console.log('Blocked by CORS:', origin);
  return callback(new Error('Not allowed by CORS'));
};

// Socket
const io = new Server(httpServer, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
setupSocket(io);
app.set('io', io);

// Middleware
app.use(helmet());

app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
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
app.use('/api/chat', chatRoutes);

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Error
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
