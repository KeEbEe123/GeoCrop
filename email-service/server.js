import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes.js';
import emailService from './services/emailService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure we bind to 0.0.0.0 for Render
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://localhost:8080', // Alternative React dev server
  'http://localhost:5000', // Flask dev server
  process.env.APP_URL || 'http://localhost:5173'
];

// Add production URLs if they exist
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// For production, allow common deployment platforms
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.netlify\.app$/,
    /https:\/\/.*\.onrender\.com$/,
    /https:\/\/.*\.herokuapp\.com$/
  );
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Email-specific rate limiting
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 email requests per minute
  message: {
    success: false,
    message: 'Too many email requests, please try again later.'
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Origin:', req.get('origin'));
  next();
});

// Add response headers for better debugging
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Apply email rate limiting to email routes
app.use('/api/email', emailLimiter);

// Routes
app.use('/api/email', emailRoutes);

// Root endpoint
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize email service and start server
async function startServer() {
  try {
    console.log('🚀 Starting Yield Mentor Email Service...');
    
    // Initialize email service
    const emailInitialized = await emailService.initialize();
    
    if (!emailInitialized) {
      console.warn('⚠️  Email service initialization failed, but server will continue running');
      console.warn('⚠️  Please check your Gmail SMTP configuration in .env file');
    }
    
    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`✅ Email service running on ${HOST}:${PORT}`);
      console.log(`📧 Gmail SMTP: ${emailInitialized ? 'Connected' : 'Not Connected'}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Health check: http://${HOST}:${PORT}/api/email/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available endpoints:');
        console.log(`   GET  http://${HOST}:${PORT}/`);
        console.log(`   GET  http://${HOST}:${PORT}/api/email/health`);
        console.log(`   POST http://${HOST}:${PORT}/api/email/send-welcome`);
        console.log(`   POST http://${HOST}:${PORT}/api/email/send-email`);
        console.log(`   POST http://${HOST}:${PORT}/api/email/test`);
        console.log('\n🔑 Don\'t forget to set your API key in requests!');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();