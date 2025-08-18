import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes';
import settingsRoutes from './routes/settings.routes';
import profileRoutes from './routes/profile.routes';
import healthRoutes from './routes/health.routes';
import coursesRoutes from './routes/courses.routes';
import usersRoutes from './routes/users.routes';
import categoriesRoutes from './routes/categories.routes';
import dashboardRoutes from './routes/dashboard.routes';
import questionsRoutes from './routes/questions.routes';
import flashcardsRoutes from './routes/flashcards.routes';
import flashcardDecksRoutes from './routes/flashcard-decks.routes';
import mockexamsRoutes from './routes/mockexams-postgres.routes';
import mockexamsStatsRoutes from './routes/mockexams-stats.routes';
import previousexamsRoutes from './routes/previousexams.routes';
import previousexamsExtraRoutes from './routes/previousexams-extra.routes';
import summariesRoutes from './routes/summaries.routes';
import legislationRoutes from './routes/legislation.routes';
import examSessionsRoutes from './routes/exam-sessions.routes';
import scheduleRoutes from './routes/schedule.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';
import commentsRoutes from './routes/comments.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8181;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files (for uploads)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/questions', questionsRoutes);
app.use('/api/v1/flashcards', flashcardsRoutes);
app.use('/api/v1/flashcard-decks', flashcardDecksRoutes);
app.use('/api/v1/mockexams', mockexamsRoutes);
app.use('/api/v1/mockexams-stats', mockexamsStatsRoutes);
app.use('/api/v1/previousexams', previousexamsRoutes);
app.use('/api/v1/previousexams-extra', previousexamsExtraRoutes);
app.use('/api/v1/summaries', summariesRoutes);
app.use('/api/v1/legislation', legislationRoutes);
app.use('/api/v1/exams', examSessionsRoutes);
app.use('/api/v1/exam-sessions', examSessionsRoutes);
app.use('/api/v1/schedule', scheduleRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/subscription', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/comments', commentsRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'estudos-backend-node',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      '/api/v1/health': 'Health check',
      '/api/v1/auth': 'Authentication endpoints',
      '/api/v1/settings': 'Settings management',
      '/api/v1/profile': 'User profile management',
      '/api/v1/courses': 'Courses management',
      '/api/v1/users': 'Users management',
      '/api/v1/categories': 'Categories management',
      '/api/v1/dashboard': 'Dashboard statistics',
      '/api/v1/questions': 'Questions management',
      '/api/v1/flashcards': 'Flashcards management',
      '/api/v1/flashcard-decks': 'Flashcard decks/arsenals management',
      '/api/v1/mockexams': 'Mock exams management',
      '/api/v1/previousexams': 'Previous exams management',
      '/api/v1/summaries': 'Summaries management',
      '/api/v1/legislation': 'Legislation management',
      '/api/v1/exams': 'Exam sessions management',
      '/api/v1/exam-sessions': 'Exam sessions management',
      '/api/v1/schedule': 'Schedule and task management',
      '/api/v1/payment': 'Payment and billing management',
      '/api/v1/subscription': 'Subscription management'
    }
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});