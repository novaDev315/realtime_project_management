import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getTimeEntries,
  createTimeEntry,
  startTimer,
  stopTimer,
  updateTimeEntry,
  deleteTimeEntry,
  approveTimeEntry,
  getTimeReport,
} from '../controllers/timeTrackingController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Time entry routes
router.put('/:id', updateTimeEntry)
router.delete('/:id', deleteTimeEntry)
router.post('/:id/stop', stopTimer)
router.post('/:id/approve', approveTimeEntry)

export default router

// Project-specific time tracking routes
export const projectTimeTrackingRoutes = Router()
projectTimeTrackingRoutes.use(authenticate)
projectTimeTrackingRoutes.get('/:projectId/time-entries', getTimeEntries)
projectTimeTrackingRoutes.post('/:projectId/time-entries', createTimeEntry)
projectTimeTrackingRoutes.post('/:projectId/time-entries/start', startTimer)
projectTimeTrackingRoutes.get('/:projectId/time-report', getTimeReport)
