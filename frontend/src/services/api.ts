import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Project APIs
export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// Board APIs
export const boardApi = {
  getAll: (projectId: string) => api.get(`/projects/${projectId}/boards`),
  getById: (id: string) => api.get(`/boards/${id}`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/boards`, data),
  update: (id: string, data: any) => api.put(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),
}

// Card APIs
export const cardApi = {
  create: (boardId: string, columnId: string, data: any) =>
    api.post(`/boards/${boardId}/columns/${columnId}/cards`, data),
  update: (cardId: string, data: any) => api.put(`/cards/${cardId}`, data),
  move: (cardId: string, data: any) => api.put(`/cards/${cardId}/move`, data),
  delete: (cardId: string) => api.delete(`/cards/${cardId}`),
  addComment: (cardId: string, data: any) => api.post(`/cards/${cardId}/comments`, data),
  addAttachment: (cardId: string, data: FormData) =>
    api.post(`/cards/${cardId}/attachments`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Sprint APIs
export const sprintApi = {
  getAll: (projectId: string) => api.get(`/projects/${projectId}/sprints`),
  getById: (id: string) => api.get(`/sprints/${id}`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/sprints`, data),
  update: (id: string, data: any) => api.put(`/sprints/${id}`, data),
  delete: (id: string) => api.delete(`/sprints/${id}`),
  start: (id: string) => api.post(`/sprints/${id}/start`),
  complete: (id: string) => api.post(`/sprints/${id}/complete`),
  addCard: (id: string, cardId: string) => api.post(`/sprints/${id}/cards/${cardId}`),
  removeCard: (id: string, cardId: string) => api.delete(`/sprints/${id}/cards/${cardId}`),
}

// Team APIs
export const teamApi = {
  getMembers: (projectId: string) => api.get(`/projects/${projectId}/members`),
  addMember: (projectId: string, data: any) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  updateRole: (projectId: string, userId: string, role: string) =>
    api.put(`/projects/${projectId}/members/${userId}/role`, { role }),
}

export default api
