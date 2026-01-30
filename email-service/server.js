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

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // React dev server
    'http://localhost:8080', // Alternative React dev server
    'http://localhost:5000', // Flask dev server
    process.env.APP_URL || 'http://localhost:5173'
  ],
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
    app.listen(PORT, () => {
      console.log(`✅ Email service running on port ${PORT}`);
      console.log(`📧 Gmail SMTP: ${emailInitialized ? 'Connected' : 'Not Connected'}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/email/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available endpoints:');
        console.log(`   GET  http://localhost:${PORT}/`);
        console.log(`   GET  http://localhost:${PORT}/api/email/health`);
        console.log(`   POST http://localhost:${PORT}/api/email/send-welcome`);
        console.log(`   POST http://localhost:${PORT}/api/email/send-email`);
        console.log(`   POST http://localhost:${PORT}/api/email/test`);
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