import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import boardReducer from './slices/boardSlice'
import sprintReducer from './slices/sprintSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    board: boardReducer,
    sprint: sprintReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
