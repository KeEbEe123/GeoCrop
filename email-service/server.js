import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import emailRoutes from './routes/emailRoutes.js';
import emailService from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ============================================================
   ✅ CORS — MUST BE FIRST
   ============================================================ */

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://geo-crop.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ PRE-FLIGHT FIX

/* ============================================================
   Security & Parsing
   ============================================================ */

app.use(helmet());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ============================================================
   Debug Logging (safe to keep for now)
   ============================================================ */

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin}`
  );
  next();
});

/* ============================================================
   Rate Limiting
   ============================================================ */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// ❗ Apply email limiter ONLY to POST routes (NOT OPTIONS)
const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many email requests, please try again later.'
  }
});

app.post('/api/email/send-welcome', emailLimiter);
app.post('/api/email/send-email', emailLimiter);
app.post('/api/email/test', emailLimiter);

/* ============================================================
   Routes
   ============================================================ */

app.use('/api/email', emailRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Yield Mentor Email Service',
    version: '1.0.0',
    status: emailService.getStatus(),
    endpoints: {
      health: '/api/email/health',
      sendWelcome: '/api/email/send-welcome',
      sendEmail: '/api/email/send-email',
      test: '/api/email/test'
    }
  });
});

/* ============================================================
   Error Handling
   ============================================================ */

app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

/* ============================================================
   Server Startup
   ============================================================ */

async function startServer() {
  try {
    console.log('🚀 Starting Yield Mentor Email Service...');

    const emailInitialized = await emailService.initialize();

    if (!emailInitialized) {
      console.warn('⚠️ Email service failed to initialize');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📧 Email status: ${emailInitialized ? 'Connected' : 'Not connected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Startup failure:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startServer();
