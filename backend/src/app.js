const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const atsRoutes = require('./routes/atsRoutes');
const skillsRoutes = require('./routes/skillsRoutes');
const paymentRoutes = require('./routes/fakePaymentRoutes');
const manualPaymentRoutes = require('./routes/manualPaymentRoutes');

const app = express();

// Middleware Setup
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 5000 requests per windowMs to prevent developer blocking
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', apiLimiter);

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment/manual', manualPaymentRoutes);

app.get('/', (req, res) => {
  res.send('HireMind AI Backend Running');
});

// Centralized error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

module.exports = app;