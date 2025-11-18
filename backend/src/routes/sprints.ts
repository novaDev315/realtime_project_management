import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  addCardToSprint,
  removeCardFromSprint,
} from '../controllers/sprintController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Sprint routes
router.get('/:id', getSprintById)
router.put('/:id', updateSprint)
router.delete('/:id', deleteSprint)
router.post('/:id/start', startSprint)
router.post('/:id/complete', completeSprint)
router.post('/:id/cards/:cardId', addCardToSprint)
router.delete('/:id/cards/:cardId', removeCardFromSprint)

export default router

// Project-specific sprint routes
export const projectSprintRoutes = Router()
projectSprintRoutes.use(authenticate)
projectSprintRoutes.get('/:projectId/sprints', getSprints)
projectSprintRoutes.post(
  '/:projectId/sprints',
  [
    body('name').trim().notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('capacity').isNumeric(),
  ],
  createSprint
)
