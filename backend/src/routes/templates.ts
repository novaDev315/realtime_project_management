import express from 'express'
import { authenticate } from '../middleware/auth'
import * as templateController from '../controllers/templateController'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all templates
router.get('/', templateController.getTemplates)

// Get template by ID
router.get('/:id', templateController.getTemplateById)

// Create custom template
router.post('/', templateController.createTemplate)

// Update template
router.put('/:id', templateController.updateTemplate)

// Delete template
router.delete('/:id', templateController.deleteTemplate)

// Create project from template
router.post('/:templateId/create-project', templateController.createProjectFromTemplate)

// Save project as template
router.post('/from-project/:projectId', templateController.saveProjectAsTemplate)

export default router
