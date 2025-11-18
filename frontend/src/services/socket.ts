import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback)
      if (this.socket) {
        this.socket.off(event, callback as any)
      }
    } else {
      this.listeners.delete(event)
      if (this.socket) {
        this.socket.off(event)
      }
    }
  }

  // Board events
  joinBoard(boardId: string) {
    this.emit('board:join', { boardId })
  }

  leaveBoard(boardId: string) {
    this.emit('board:leave', { boardId })
  }

  // Card events
  createCard(data: any) {
    this.emit('card:create', data)
  }

  updateCard(data: any) {
    this.emit('card:update', data)
  }

  moveCard(data: any) {
    this.emit('card:move', data)
  }

  deleteCard(data: any) {
    this.emit('card:delete', data)
  }

  // Presence events
  updateCursor(data: { x: number; y: number }) {
    this.emit('cursor:move', data)
  }

  userTyping(data: { cardId: string; typing: boolean }) {
    this.emit('user:typing', data)
  }

  // Sprint events
  joinSprint(sprintId: string) {
    this.emit('sprint:join', { sprintId })
  }

  leaveSprint(sprintId: string) {
    this.emit('sprint:leave', { sprintId })
  }

  updateSprint(data: any) {
    this.emit('sprint:update', data)
  }
}

export const socketService = new SocketService()
