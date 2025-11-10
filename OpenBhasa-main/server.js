require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const recordingRoutes = require('./routes/recordingRoutes');
const taskRequestRoutes = require('./routes/taskRequestRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS to allow the frontend origin and credentials (cookies)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://openbhasa-frontend.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173'
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      // Allow if origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development: allow any localhost
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Log rejected origins for debugging
      console.log('CORS: Rejected origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/task-requests', taskRequestRoutes);
app.use('/api/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Authentication API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});