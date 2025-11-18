import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Card {
  _id: string
  title: string
  description: string
  assignees: string[]
  labels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  storyPoints?: number
  dueDate?: string
  attachments: any[]
  comments: any[]
  position: number
  columnId: string
  boardId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  _id: string
  name: string
  cards: Card[]
  position: number
}

export interface Board {
  _id: string
  name: string
  projectId: string
  columns: Column[]
  createdAt: string
  updatedAt: string
}

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
  activeUsers: { [userId: string]: { name: string; cursor?: { x: number; y: number } } }
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
  activeUsers: {},
}

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload
      state.loading = false
    },
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload)
    },
    updateBoard: (state, action: PayloadAction<Board>) => {
      const index = state.boards.findIndex(b => b._id === action.payload._id)
      if (index !== -1) {
        state.boards[index] = action.payload
      }
      if (state.currentBoard?._id === action.payload._id) {
        state.currentBoard = action.payload
      }
    },
    addCard: (state, action: PayloadAction<{ columnId: string; card: Card }>) => {
      if (state.currentBoard) {
        const column = state.currentBoard.columns.find(c => c._id === action.payload.columnId)
        if (column) {
          column.cards.push(action.payload.card)
        }
      }
    },
    updateCard: (state, action: PayloadAction<Card>) => {
      if (state.currentBoard) {
        for (const column of state.currentBoard.columns) {
          const cardIndex = column.cards.findIndex(c => c._id === action.payload._id)
          if (cardIndex !== -1) {
            column.cards[cardIndex] = action.payload
            break
          }
        }
      }
    },
    moveCard: (
      state,
      action: PayloadAction<{
        cardId: string
        sourceColumnId: string
        targetColumnId: string
        position: number
      }>
    ) => {
      if (state.currentBoard) {
        const { cardId, sourceColumnId, targetColumnId, position } = action.payload
        const sourceColumn = state.currentBoard.columns.find(c => c._id === sourceColumnId)
        const targetColumn = state.currentBoard.columns.find(c => c._id === targetColumnId)

        if (sourceColumn && targetColumn) {
          const cardIndex = sourceColumn.cards.findIndex(c => c._id === cardId)
          if (cardIndex !== -1) {
            const [card] = sourceColumn.cards.splice(cardIndex, 1)
            card.columnId = targetColumnId
            card.position = position
            targetColumn.cards.splice(position, 0, card)
          }
        }
      }
    },
    deleteCard: (state, action: PayloadAction<{ cardId: string; columnId: string }>) => {
      if (state.currentBoard) {
        const column = state.currentBoard.columns.find(c => c._id === action.payload.columnId)
        if (column) {
          column.cards = column.cards.filter(c => c._id !== action.payload.cardId)
        }
      }
    },
    setActiveUsers: (state, action: PayloadAction<BoardState['activeUsers']>) => {
      state.activeUsers = action.payload
    },
    updateUserCursor: (
      state,
      action: PayloadAction<{ userId: string; cursor: { x: number; y: number } }>
    ) => {
      if (state.activeUsers[action.payload.userId]) {
        state.activeUsers[action.payload.userId].cursor = action.payload.cursor
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setBoards,
  setCurrentBoard,
  addBoard,
  updateBoard,
  addCard,
  updateCard,
  moveCard,
  deleteCard,
  setActiveUsers,
  updateUserCursor,
  setLoading,
  setError,
} = boardSlice.actions

export default boardSlice.reducer
