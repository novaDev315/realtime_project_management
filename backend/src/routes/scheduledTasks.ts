import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  getScheduledTasks,
  getScheduledTaskById,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  toggleScheduledTask,
  runScheduledTaskNow,
} from '../controllers/scheduledTaskController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Scheduled task routes
router.get('/:id', getScheduledTaskById)
router.put('/:id', updateScheduledTask)
router.delete('/:id', deleteScheduledTask)
router.post('/:id/toggle', toggleScheduledTask)
router.post('/:id/run', runScheduledTaskNow)

export default router

// Project-specific scheduled task routes
export const projectScheduledTaskRoutes = Router()
projectScheduledTaskRoutes.use(authenticate)
projectScheduledTaskRoutes.get('/:projectId/scheduled-tasks', getScheduledTasks)
projectScheduledTaskRoutes.post(
  '/:projectId/scheduled-tasks',
  [
    body('name').notEmpty().withMessage('Task name is required'),
    body('schedule').notEmpty().withMessage('Cron schedule is required'),
    body('action').notEmpty().withMessage('Action configuration is required'),
  ],
  createScheduledTask
)
