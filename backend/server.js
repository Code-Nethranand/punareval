const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const dbConnect = require("./Database/databaseConnection");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const examRoutes = require("./routes/examRoutes");
const revaluationRoutes = require("./routes/revaluationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { verifyToken } = require("./middleware/auth");
const statusMonitor = require('express-status-monitor');
const logger = require('./utils/logger');
const performanceMonitor = require('./utils/performanceMonitor');
const { rateLimiter, speedLimiter } = require('./utils/rateLimiter');

// Increase event listener limit
require('events').EventEmitter.defaultMaxListeners = 15;

// Enable status monitoring
app.use(statusMonitor({
    title: 'Server Status',
    path: '/status',
    spans: [{
        interval: 1,
        retention: 60
    }, {
        interval: 5,
        retention: 60
    }, {
        interval: 15,
        retention: 60
    }]
}));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Apply global middleware
app.use(performanceMonitor);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[HIDDEN]' : undefined
    },
    query: req.query,
    body: req.body
  });
  next();
});

// Apply rate limiting and speed limiting to result-related routes
app.use('/api/exams', rateLimiter);
app.use('/api/exams', speedLimiter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "VTU Revaluation API Server",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      CASHFREE_BASE_URL: process.env.CASHFREE_BASE_URL
    }
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/revaluation", revaluationRoutes);
app.use("/api/students", studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Connect to database
dbConnect().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    console.log('Environment:', process.env.NODE_ENV);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Performing graceful shutdown...');
  server.close(() => {
    logger.info('Server closed. Exiting process.');
    process.exit(0);
  });
});
