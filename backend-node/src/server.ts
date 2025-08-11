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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8180;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
      '/api/v1/categories': 'Categories management'
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