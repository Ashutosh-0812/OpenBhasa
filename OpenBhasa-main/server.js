require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
// Configure CORS to allow the frontend origin and credentials (cookies)
const FRONTEND_ORIGIN = process.env.CLIENT_URL || 'https://openbhasa.onrender.com'
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true)
      // Allow the configured frontend origin
      if (origin === FRONTEND_ORIGIN) return callback(null, true)
      // Reject other origins
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  })
)

// Routes
app.use('/api/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Authentication API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});