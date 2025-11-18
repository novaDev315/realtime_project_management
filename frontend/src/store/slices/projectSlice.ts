import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Project {
  _id: string
  name: string
  description: string
  teamId: string
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
      state.loading = false
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p._id === action.payload._id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
      if (state.currentProject?._id === action.payload._id) {
        state.currentProject = action.payload
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p._id !== action.payload)
      if (state.currentProject?._id === action.payload) {
        state.currentProject = null
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
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
  setLoading,
  setError,
} = projectSlice.actions

export default projectSlice.reducer
