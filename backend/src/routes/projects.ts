import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Project routes
router.get('/', getProjects)
router.get('/:id', getProjectById)
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
  ],
  createProject
)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// Member management
router.post('/:id/members', addMember)
router.delete('/:id/members/:memberId', removeMember)

export default router
