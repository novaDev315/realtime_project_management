import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Sprint {
  _id: string
  name: string
  goal: string
  projectId: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed'
  capacity: number
  velocity?: number
  cards: string[]
  createdAt: string
  updatedAt: string
}

interface SprintState {
  sprints: Sprint[]
  currentSprint: Sprint | null
  loading: boolean
  error: string | null
}

const initialState: SprintState = {
  sprints: [],
  currentSprint: null,
  loading: false,
  error: null,
}

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    setSprints: (state, action: PayloadAction<Sprint[]>) => {
      state.sprints = action.payload
      state.loading = false
    },
    setCurrentSprint: (state, action: PayloadAction<Sprint>) => {
      state.currentSprint = action.payload
    },
    addSprint: (state, action: PayloadAction<Sprint>) => {
      state.sprints.push(action.payload)
    },
    updateSprint: (state, action: PayloadAction<Sprint>) => {
      const index = state.sprints.findIndex(s => s._id === action.payload._id)
      if (index !== -1) {
        state.sprints[index] = action.payload
      }
      if (state.currentSprint?._id === action.payload._id) {
        state.currentSprint = action.payload
      }
    },
    deleteSprint: (state, action: PayloadAction<string>) => {
      state.sprints = state.sprints.filter(s => s._id !== action.payload)
      if (state.currentSprint?._id === action.payload) {
        state.currentSprint = null
      }
    },
    addCardToSprint: (state, action: PayloadAction<{ sprintId: string; cardId: string }>) => {
      const sprint = state.sprints.find(s => s._id === action.payload.sprintId)
      if (sprint && !sprint.cards.includes(action.payload.cardId)) {
        sprint.cards.push(action.payload.cardId)
      }
      if (state.currentSprint?._id === action.payload.sprintId) {
        state.currentSprint.cards.push(action.payload.cardId)
      }
    },
    removeCardFromSprint: (state, action: PayloadAction<{ sprintId: string; cardId: string }>) => {
      const sprint = state.sprints.find(s => s._id === action.payload.sprintId)
      if (sprint) {
        sprint.cards = sprint.cards.filter(id => id !== action.payload.cardId)
      }
      if (state.currentSprint?._id === action.payload.sprintId) {
        state.currentSprint.cards = state.currentSprint.cards.filter(
          id => id !== action.payload.cardId
        )
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
  setSprints,
  setCurrentSprint,
  addSprint,
  updateSprint,
  deleteSprint,
  addCardToSprint,
  removeCardFromSprint,
  setLoading,
  setError,
} = sprintSlice.actions

export default sprintSlice.reducer
