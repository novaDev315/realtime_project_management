import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { connectDatabase } from './config/database'
import { connectRedis } from './config/redis'
import { initializeSocket } from './socket/socketHandler'

// Routes
import authRoutes from './routes/auth'
import projectRoutes from './routes/projects'
import boardRoutes, { projectBoardRoutes } from './routes/boards'
import cardRoutes, { boardCardRoutes } from './routes/cards'
import sprintRoutes, { projectSprintRoutes } from './routes/sprints'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects', projectBoardRoutes)
app.use('/api/projects', projectSprintRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/boards', boardCardRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/sprints', sprintRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Initialize database and start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase()

    // Connect to Redis
    await connectRedis()

    // Initialize Socket.io
    initializeSocket(io)

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export { app, io }
