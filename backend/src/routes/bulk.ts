import { Router } from 'express'
import { auth } from '../middleware/auth'
import {
  bulkUpdateCards,
  bulkMoveCards,
  bulkAssignCards,
  bulkAddLabels,
  bulkDeleteCards,
  bulkAddToSprint,
  bulkSetPriority,
  bulkSetDueDate,
} from '../controllers/bulkController'

const router = Router()

// All routes require authentication
router.use(auth)

// Generic bulk update
router.put('/cards', bulkUpdateCards)

// Specific bulk actions
router.post('/cards/move', bulkMoveCards)
router.post('/cards/assign', bulkAssignCards)
router.post('/cards/labels', bulkAddLabels)
router.post('/cards/sprint', bulkAddToSprint)
router.post('/cards/priority', bulkSetPriority)
router.post('/cards/due-date', bulkSetDueDate)
router.delete('/cards', bulkDeleteCards)

export default router
