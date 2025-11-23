import express from 'express'
import { authenticate } from '../middleware/auth'
import * as searchController from '../controllers/searchController'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Global search
router.get('/', searchController.globalSearch)

// Quick search (autocomplete)
router.get('/quick', searchController.quickSearch)

// Search within project
router.get('/project/:projectId', searchController.searchInProject)

// Advanced search with filters
router.post('/advanced', searchController.advancedSearch)

export default router
