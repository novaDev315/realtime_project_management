import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { socketService } from '@/services/socket'

export const useSocket = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const socketRef = useRef(socketService)

  useEffect(() => {
    if (token) {
      socketRef.current.connect(token)
    }

    return () => {
      socketRef.current.disconnect()
    }
  }, [token])

  return socketRef.current
}

export const useBoardSocket = (boardId: string | null) => {
  const socket = useSocket()

  useEffect(() => {
    if (boardId) {
      socket.joinBoard(boardId)

      return () => {
        socket.leaveBoard(boardId)
      }
    }
  }, [boardId, socket])

  return socket
}
