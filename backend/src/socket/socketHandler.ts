import { Server, Socket } from 'socket.io'
import { verifyToken } from '../utils/jwt'
import { createAdapter } from '@socket.io/redis-adapter'
import { redisClient } from '../config/redis'
import { createClient } from 'redis'

interface SocketUser {
  userId: string
  email: string
  name: string
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser
}

// Store active users per board
const activeBoardUsers = new Map<string, Set<string>>()

export const initializeSocket = (io: Server) => {
  // Set up Redis adapter for horizontal scaling
  const pubClient = redisClient
  const subClient = pubClient.duplicate()

  Promise.all([subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient))
    console.log('Socket.io Redis adapter initialized')
  })

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = verifyToken(token)
      socket.user = decoded as SocketUser
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.userId}`)

    // Board events
    socket.on('board:join', ({ boardId }) => {
      socket.join(`board:${boardId}`)

      // Track active users
      if (!activeBoardUsers.has(boardId)) {
        activeBoardUsers.set(boardId, new Set())
      }
      activeBoardUsers.get(boardId)!.add(socket.user!.userId)

      // Broadcast user joined
      io.to(`board:${boardId}`).emit('user:joined', {
        userId: socket.user!.userId,
        name: socket.user!.name,
        activeUsers: Array.from(activeBoardUsers.get(boardId)!),
      })

      console.log(`User ${socket.user?.userId} joined board ${boardId}`)
    })

    socket.on('board:leave', ({ boardId }) => {
      socket.leave(`board:${boardId}`)

      // Remove from active users
      activeBoardUsers.get(boardId)?.delete(socket.user!.userId)

      // Broadcast user left
      io.to(`board:${boardId}`).emit('user:left', {
        userId: socket.user!.userId,
        activeUsers: Array.from(activeBoardUsers.get(boardId) || []),
      })

      console.log(`User ${socket.user?.userId} left board ${boardId}`)
    })

    // Card events
    socket.on('card:create', (data) => {
      io.to(`board:${data.boardId}`).emit('card:created', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    socket.on('card:update', (data) => {
      io.to(`board:${data.boardId}`).emit('card:updated', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    socket.on('card:move', (data) => {
      io.to(`board:${data.boardId}`).emit('card:moved', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    socket.on('card:delete', (data) => {
      io.to(`board:${data.boardId}`).emit('card:deleted', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    // Presence events
    socket.on('cursor:move', (data) => {
      socket.broadcast.to(`board:${data.boardId}`).emit('cursor:moved', {
        userId: socket.user!.userId,
        userName: socket.user!.name,
        x: data.x,
        y: data.y,
      })
    })

    socket.on('user:typing', (data) => {
      socket.broadcast.to(`board:${data.boardId}`).emit('user:typing', {
        userId: socket.user!.userId,
        cardId: data.cardId,
        typing: data.typing,
      })
    })

    // Sprint events
    socket.on('sprint:join', ({ sprintId }) => {
      socket.join(`sprint:${sprintId}`)
      console.log(`User ${socket.user?.userId} joined sprint ${sprintId}`)
    })

    socket.on('sprint:leave', ({ sprintId }) => {
      socket.leave(`sprint:${sprintId}`)
      console.log(`User ${socket.user?.userId} left sprint ${sprintId}`)
    })

    socket.on('sprint:update', (data) => {
      io.to(`sprint:${data.sprintId}`).emit('sprint:updated', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    socket.on('sprint:start', (data) => {
      io.to(`sprint:${data.sprintId}`).emit('sprint:started', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    socket.on('sprint:complete', (data) => {
      io.to(`sprint:${data.sprintId}`).emit('sprint:completed', {
        ...data,
        userId: socket.user!.userId,
      })
    })

    // Comment events
    socket.on('comment:add', (data) => {
      io.to(`board:${data.boardId}`).emit('comment:added', {
        ...data,
        userId: socket.user!.userId,
        userName: socket.user!.name,
      })
    })

    // WebRTC signaling events
    socket.on('webrtc:join-room', ({ roomId }) => {
      socket.join(`webrtc:${roomId}`)
      socket.to(`webrtc:${roomId}`).emit('webrtc:user-joined', {
        userId: socket.user!.userId,
        userName: socket.user!.name,
      })
      console.log(`User ${socket.user?.userId} joined WebRTC room ${roomId}`)
    })

    socket.on('webrtc:leave-room', ({ roomId }) => {
      socket.leave(`webrtc:${roomId}`)
      socket.to(`webrtc:${roomId}`).emit('webrtc:user-left', {
        userId: socket.user!.userId,
      })
      console.log(`User ${socket.user?.userId} left WebRTC room ${roomId}`)
    })

    socket.on('webrtc:offer', ({ to, offer }) => {
      io.to(to).emit('webrtc:offer', {
        from: socket.user!.userId,
        offer,
      })
    })

    socket.on('webrtc:answer', ({ to, answer }) => {
      io.to(to).emit('webrtc:answer', {
        from: socket.user!.userId,
        answer,
      })
    })

    socket.on('webrtc:ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('webrtc:ice-candidate', {
        from: socket.user!.userId,
        candidate,
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      // Remove user from all boards
      activeBoardUsers.forEach((users, boardId) => {
        if (users.has(socket.user!.userId)) {
          users.delete(socket.user!.userId)
          io.to(`board:${boardId}`).emit('user:left', {
            userId: socket.user!.userId,
            activeUsers: Array.from(users),
          })
        }
      })

      console.log(`User disconnected: ${socket.user?.userId}`)
    })
  })

  return io
}
