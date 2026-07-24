import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import outingRoutes from './routes/outingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import caretakerRoutes from './routes/caretakerRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Support base64 image strings
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Route registrations
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes); // Was students
app.use('/api/outings', outingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/caretaker', caretakerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'Running',
    service: 'Student Outing Management System API',
    timestamp: new Date(),
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\x1b[31m[Error Handler] Error occurred:\x1b[0m', err.message);
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server listener
const startServer = async () => {
  const isConnected = await connectDB();
  
  if (isConnected) {
    // Run Database Seeder to insert demo records if empty
    // await seedData();
    console.log('[Server] Automatic seeding disabled to prevent overwriting imported data.');
  } else {
    console.log('\x1b[33m[Server] Server starting with database disconnected. Ensure MongoDB is active.\x1b[0m');
  }

  app.listen(PORT, () => {
    console.log(`\x1b[32m[Server] Server is running on port ${PORT}\x1b[0m`);
    console.log(`\x1b[36m[Server] API URL: http://localhost:${PORT}\x1b[0m`);
  });
};

startServer();
