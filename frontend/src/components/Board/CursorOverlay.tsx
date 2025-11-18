'use client'

import { useEffect, useState, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'

interface Cursor {
  userId: string
  userName: string
  x: number
  y: number
  lastUpdate: number
}

interface CursorOverlayProps {
  boardId: string
  currentUserId?: string
}

// Predefined colors for different users
const CURSOR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export default function CursorOverlay({ boardId, currentUserId }: CursorOverlayProps) {
  const socket = useSocket()
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const throttleRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!boardId) return

    // Listen for cursor movements from other users
    socket.on('cursor:moved', (data: { userId: string; userName: string; x: number; y: number }) => {
      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          x: data.x,
          y: data.y,
          lastUpdate: Date.now(),
        })
        return newCursors
      })
    })

    // Track own cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Throttle cursor updates to avoid overwhelming the server
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }

      throttleRef.current = setTimeout(() => {
        socket.emit('cursor:move', {
          boardId,
          x,
          y,
        })
      }, 50) // 50ms throttle = ~20 updates per second
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      socket.off('cursor:moved')
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [boardId, socket])

  // Clean up stale cursors (haven't moved in 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCursors((prev) => {
        const newCursors = new Map(prev)
        newCursors.forEach((cursor, userId) => {
          if (now - cursor.lastUpdate > 5000) {
            newCursors.delete(userId)
          }
        })
        return newCursors
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getUserColor = (userId: string): string => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return CURSOR_COLORS[hash % CURSOR_COLORS.length]
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ overflow: 'visible' }}
    >
      {Array.from(cursors.values())
        .filter((cursor) => cursor.userId !== currentUserId)
        .map((cursor) => (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-100 ease-linear"
            style={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              <path
                d="M5 3L19 12L12 13L9 19L5 3Z"
                fill={getUserColor(cursor.userId)}
                stroke="white"
                strokeWidth="1"
              />
            </svg>

            {/* User label */}
            <div
              className="absolute left-6 top-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: getUserColor(cursor.userId),
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {cursor.userName}
            </div>
          </div>
        ))}
    </div>
  )
}
