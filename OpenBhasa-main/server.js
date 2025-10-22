require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require('./config/database')
const authRoutes = require('./routes/authRoutes')
const participantInviteRoutes = require('./routes/participantInviteRoutes')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/participant-invites', participantInviteRoutes)
app.use('/api/tasks', taskRoutes)

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Authentication API is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
