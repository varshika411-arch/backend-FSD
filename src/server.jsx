import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.jsx';
import studentRoutes from './routes/students.jsx';
import achievementRoutes from './routes/achievements.jsx';
import eventRoutes from './routes/events.jsx';
import adminRoutes from './routes/admin.jsx';
import pool from './config/database.jsx';
import { register, login } from './controllers/authController.jsx';
import { errorHandler } from './middleware/errorHandler.jsx';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',').map(origin => origin.trim());
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.post('/api/register', register);
app.post('/api/login', login);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'AchieveTrack API is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
app.use(errorHandler);
const PORT = Number(process.env.PORT) || 5000;
let server;

const startServer = async () => {
  await pool.query('SELECT 1');

  server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});

  server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using that port or update PORT in backend/.env.`);
    process.exit(1);
  }

  console.error('Failed to start server:', error);
  process.exit(1);
  });
};

startServer().catch(error => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});

export default app;
